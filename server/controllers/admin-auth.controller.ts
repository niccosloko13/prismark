import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { withController } from "@/server/controllers/controller-utils";
import { authService, toSessionUser } from "@/server/services/auth.service";
import { buildSessionCookieOptions, signSessionToken } from "@/server/services/session.service";

function setSessionCookie(response: NextResponse, token: string) {
  const cookieOptions = buildSessionCookieOptions();
  response.cookies.set({
    ...cookieOptions,
    value: token,
  });
}

export async function adminLoginController(request: NextRequest) {
  return withController(async () => {
    const body = (await request.json()) as { username?: string; password?: string };
    const user = await authService.authenticateAdmin({
      username: body.username ?? "",
      password: body.password ?? "",
    });

    const sessionUser = toSessionUser(user);
    const token = await signSessionToken(sessionUser);
    const response = NextResponse.json({ user: sessionUser });
    setSessionCookie(response, token);
    return response;
  });
}

export async function adminLogoutController() {
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

export async function adminMeController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: session });
  });
}
