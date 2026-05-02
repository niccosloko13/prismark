import { NextRequest, NextResponse } from "next/server";

import { postGoogleOAuthSuccessPath, sanitizeReturnTo } from "@/lib/safe-return-to";
import { withController } from "@/server/controllers/controller-utils";
import { isAppError } from "@/server/errors/app-error";
import { authService, toSessionUser } from "@/server/services/auth.service";
import { logger } from "@/server/services/logger";
import {
  buildGoogleOauthStateCookieOptions,
  googleOauthService,
  tryReadGoogleOauthReturnTo,
} from "@/server/services/google-oauth.service";
import { buildSessionCookieOptions, signSessionToken } from "@/server/services/session.service";

function setSessionCookie(response: NextResponse, token: string) {
  const cookieOptions = buildSessionCookieOptions();
  response.cookies.set({
    ...cookieOptions,
    value: token,
  });
}

function setGoogleOauthStateCookie(response: NextResponse, token: string) {
  const cookieOptions = buildGoogleOauthStateCookieOptions();
  response.cookies.set({
    ...cookieOptions,
    value: token,
  });
}

function clearGoogleOauthStateCookie(response: NextResponse) {
  const cookieOptions = buildGoogleOauthStateCookieOptions();
  response.cookies.set({
    ...cookieOptions,
    value: "",
    maxAge: 0,
  });
}

function buildLoginRedirect(request: NextRequest, authError: string, returnTo?: string | null) {
  const loginUrl = new URL("/login", request.url);

  const safe = sanitizeReturnTo(returnTo ?? null, "client");
  if (safe) {
    loginUrl.searchParams.set("returnTo", safe);
  }

  loginUrl.searchParams.set("authError", authError);
  return loginUrl;
}

export async function loginController(request: NextRequest) {
  return withController(async () => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const user = await authService.authenticate({
      email: body.email ?? "",
      password: body.password ?? "",
    });
    const sessionUser = toSessionUser(user);
    const token = await signSessionToken(sessionUser);
    const response = NextResponse.json({ user: sessionUser });
    setSessionCookie(response, token);
    return response;
  });
}

export async function registerController(request: NextRequest) {
  return withController(async () => {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
      password?: string;
    };

    const user = await authService.register({
      name: body.name ?? "",
      email: body.email ?? "",
      company: body.company ?? "",
      phone: body.phone ?? "",
      password: body.password ?? "",
    });
    const sessionUser = toSessionUser(user);
    const token = await signSessionToken(sessionUser);
    const response = NextResponse.json({ user: sessionUser }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  });
}

export async function logoutController() {
  return withController(async () => {
    const cookieOptions = buildSessionCookieOptions();
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      ...cookieOptions,
      value: "",
      maxAge: 0,
    });
    return response;
  });
}

export async function googleStartController(request: NextRequest) {
  try {
    const returnTo = request.nextUrl.searchParams.get("returnTo");
    const { authorizationUrl, stateCookieValue } = await googleOauthService.createAuthorizationRequest({
      returnTo,
    });
    const response = NextResponse.redirect(authorizationUrl);
    setGoogleOauthStateCookie(response, stateCookieValue);
    return response;
  } catch (error) {
    const response = NextResponse.redirect(
      buildLoginRedirect(request, isAppError(error) ? error.code : "google_auth_unavailable", request.nextUrl.searchParams.get("returnTo")),
    );
    clearGoogleOauthStateCookie(response);
    return response;
  }
}

export async function googleCallbackController(request: NextRequest) {
  const oauthStateCookie = request.cookies.get(buildGoogleOauthStateCookieOptions().name)?.value;
  const pendingReturnTo = await tryReadGoogleOauthReturnTo(oauthStateCookie);

  const googleError = request.nextUrl.searchParams.get("error");

  if (googleError) {
    const response = NextResponse.redirect(
      buildLoginRedirect(
        request,
        googleError === "access_denied" ? "google_access_denied" : "google_auth_failed",
        pendingReturnTo,
      ),
    );
    clearGoogleOauthStateCookie(response);
    return response;
  }

  try {
    const result = await googleOauthService.resolveCallback({
      code: request.nextUrl.searchParams.get("code"),
      state: request.nextUrl.searchParams.get("state"),
      stateCookie: request.cookies.get(buildGoogleOauthStateCookieOptions().name)?.value,
    });
    const sessionUser = toSessionUser(result.user);
    const token = await signSessionToken(sessionUser);
    const successPath = postGoogleOAuthSuccessPath(sessionUser.role, result.returnTo);
    const response = NextResponse.redirect(new URL(successPath, request.nextUrl.origin));
    setSessionCookie(response, token);
    clearGoogleOauthStateCookie(response);
    return response;
  } catch (error) {
    logger.error("Falha no callback de login com Google", {
      error: error instanceof Error ? error.message : String(error),
    });

    const response = NextResponse.redirect(
      buildLoginRedirect(request, isAppError(error) ? error.code : "google_auth_failed", pendingReturnTo),
    );
    clearGoogleOauthStateCookie(response);
    return response;
  }
}
