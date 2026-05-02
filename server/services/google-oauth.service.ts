import crypto from "node:crypto";

import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";

import { sanitizeReturnTo } from "@/lib/safe-return-to";
import { env } from "@/server/config/env";
import { AppError } from "@/server/errors/app-error";
import { authService } from "@/server/services/auth.service";

const GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration";
const GOOGLE_OAUTH_STATE_COOKIE = "prismarq_google_oauth";
const GOOGLE_OAUTH_STATE_TTL_SECONDS = 60 * 10;

const secret = new TextEncoder().encode(env.JWT_SECRET);

const googleDiscoverySchema = z.object({
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
  jwks_uri: z.string().url(),
});

const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  id_token: z.string().min(1),
  expires_in: z.coerce.number().positive().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const googleIdTokenSchema = z.object({
  sub: z.string().trim().min(1).max(255),
  email: z.string().email(),
  email_verified: z.literal(true),
  name: z.string().trim().min(1).max(160).optional(),
  picture: z.string().url().optional(),
  nonce: z.string().trim().min(1).optional(),
});

const googleStateTokenSchema = z.object({
  type: z.literal("google_oauth_state"),
  state: z.string().trim().min(1),
  nonce: z.string().trim().min(1),
  returnTo: z.string().trim().min(1),
});

let googleDiscoveryPromise: Promise<z.infer<typeof googleDiscoverySchema>> | null = null;
let googleJwks:
  | ReturnType<typeof createRemoteJWKSet>
  | null = null;

function ensureGoogleOauthConfigured() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError(
      "Google OAuth não está configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.",
      500,
      "google_oauth_not_configured",
    );
  }
}

/** Antes do login o papel é tratado como cliente (sem área admin). */
function normalizeReturnTo(returnTo?: string | null) {
  const safe = sanitizeReturnTo(returnTo ?? null, "client");
  return safe ?? "/";
}

function getGoogleRedirectUri() {
  return env.GOOGLE_REDIRECT_URI || `${env.APP_URL.replace(/\/$/, "")}/api/auth/google/callback`;
}

async function getGoogleDiscoveryDocument() {
  if (!googleDiscoveryPromise) {
    googleDiscoveryPromise = fetch(GOOGLE_DISCOVERY_URL, {
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new AppError("Não foi possível carregar a configuração do Google OAuth.", 502, "google_discovery_failed");
        }

        return googleDiscoverySchema.parse(await response.json());
      })
      .catch((error) => {
        googleDiscoveryPromise = null;
        throw error;
      });
  }

  return googleDiscoveryPromise;
}

async function getGoogleJwks() {
  if (!googleJwks) {
    const discovery = await getGoogleDiscoveryDocument();
    googleJwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  }

  return googleJwks;
}

async function signGoogleStateToken(payload: { state: string; nonce: string; returnTo: string }) {
  return new SignJWT({
    type: "google_oauth_state",
    state: payload.state,
    nonce: payload.nonce,
    returnTo: payload.returnTo,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${GOOGLE_OAUTH_STATE_TTL_SECONDS}s`)
    .sign(secret);
}

async function verifyGoogleStateToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return googleStateTokenSchema.parse(payload);
  } catch {
    throw new AppError("A sessão de login com Google expirou. Tente novamente.", 401, "invalid_google_oauth_state");
  }
}

/** returnTo sanitizado a partir do cookie OAuth (ex.: redirect amigável após erro/cancelamento no Google). */
export async function tryReadGoogleOauthReturnTo(stateCookie?: string | null): Promise<string | null> {
  if (!stateCookie) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(stateCookie, secret);
    const parsed = googleStateTokenSchema.parse(payload);
    return sanitizeReturnTo(parsed.returnTo, "client");
  } catch {
    return null;
  }
}

async function exchangeCodeForTokens(code: string) {
  const discovery = await getGoogleDiscoveryDocument();
  const response = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new AppError("Não foi possível concluir a autenticação com Google.", 502, "google_token_exchange_failed");
  }

  return googleTokenResponseSchema.parse(await response.json());
}

async function verifyGoogleIdToken(idToken: string, expectedNonce: string) {
  const jwks = await getGoogleJwks();
  const { payload } = await jwtVerify(idToken, jwks, {
    audience: env.GOOGLE_CLIENT_ID,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  const parsed = googleIdTokenSchema.parse(payload);

  if (parsed.nonce !== expectedNonce) {
    throw new AppError("Resposta do Google inválida para esta sessão.", 401, "google_nonce_mismatch");
  }

  return parsed;
}

export function buildGoogleOauthStateCookieOptions() {
  return {
    name: GOOGLE_OAUTH_STATE_COOKIE,
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: GOOGLE_OAUTH_STATE_TTL_SECONDS,
  };
}

export const googleOauthService = {
  async createAuthorizationRequest(input: { returnTo?: string | null }) {
    ensureGoogleOauthConfigured();
    const discovery = await getGoogleDiscoveryDocument();
    const state = crypto.randomBytes(24).toString("hex");
    const nonce = crypto.randomBytes(24).toString("hex");
    const returnTo = normalizeReturnTo(input.returnTo);
    const stateCookieValue = await signGoogleStateToken({ state, nonce, returnTo });
    const authorizationUrl = new URL(discovery.authorization_endpoint);

    authorizationUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    authorizationUrl.searchParams.set("redirect_uri", getGoogleRedirectUri());
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set("prompt", "select_account");

    return {
      authorizationUrl: authorizationUrl.toString(),
      stateCookieValue,
    };
  },

  async resolveCallback(input: {
    code?: string | null;
    state?: string | null;
    stateCookie?: string;
  }) {
    ensureGoogleOauthConfigured();

    if (!input.code) {
      throw new AppError("O Google não retornou um código de autenticação válido.", 400, "google_code_missing");
    }

    if (!input.state || !input.stateCookie) {
      throw new AppError("A validação do login com Google falhou.", 401, "google_state_missing");
    }

    const statePayload = await verifyGoogleStateToken(input.stateCookie);

    if (statePayload.state !== input.state) {
      throw new AppError("A validação do login com Google falhou.", 401, "google_state_mismatch");
    }

    const tokens = await exchangeCodeForTokens(input.code);
    const identity = await verifyGoogleIdToken(tokens.id_token, statePayload.nonce);
    const user = await authService.authenticateWithGoogle({
      googleSub: identity.sub,
      email: identity.email,
      emailVerified: identity.email_verified,
      name: identity.name,
      picture: identity.picture,
    });

    return {
      user,
      returnTo: statePayload.returnTo,
    };
  },
};
