import { SignJWT, jwtVerify } from "jose";

import { env } from "@/server/config/env";
import { AppError } from "@/server/errors/app-error";
import type { SessionTokenPayload, SessionUser } from "@/types";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export function buildSessionCookieOptions() {
  return {
    name: env.SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.SESSION_TTL_SECONDS,
  };
}

export async function signSessionToken(user: SessionUser) {
  return new SignJWT({
    role: user.role,
    email: user.email,
    type: "session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${env.SESSION_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: String(payload.sub),
      role: payload.role as SessionTokenPayload["role"],
      email: String(payload.email),
      type: payload.type as SessionTokenPayload["type"],
    } satisfies SessionTokenPayload;
  } catch {
    throw new AppError("Sessão inválida ou expirada.", 401, "invalid_session");
  }
}
