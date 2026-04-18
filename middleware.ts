import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedClientPrefixes = ["/dashboard"];
const protectedAdminPrefixes = ["/admin"];

function setSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

async function readSessionPayload(request: NextRequest) {
  const token = request.cookies.get(process.env.SESSION_COOKIE_NAME || "prismarq_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = setSecurityHeaders(NextResponse.next());

  const requiresClient = protectedClientPrefixes.some((prefix) => pathname.startsWith(prefix));
  const requiresAdmin = protectedAdminPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!requiresClient && !requiresAdmin) {
    return response;
  }

  const payload = await readSessionPayload(request);

  if (!payload?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return setSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (requiresAdmin && payload.role !== "admin") {
    return setSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
