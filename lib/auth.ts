import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { env } from "@/server/config/env";
import { usersRepository } from "@/server/repositories/users.repository";
import { toSessionUser as mapUserToSession } from "@/server/services/auth.service";
import { verifySessionToken } from "@/server/services/session.service";
import type { AppUser, SessionUser } from "@/types";

export const SESSION_COOKIE = env.SESSION_COOKIE_NAME;

export function encodeSession() {
  throw new Error("encodeSession não é mais usado. Utilize signSessionToken.");
}

export function decodeSession() {
  throw new Error("decodeSession não é mais usado. Utilize verifySessionToken.");
}

export function hashPassword() {
  throw new Error("hashPassword foi substituído pelo passwordService com bcrypt.");
}

export function toSessionUser(user: AppUser): SessionUser {
  return mapUserToSession(user);
}

async function resolveSessionUser(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await usersRepository.findById(payload.sub);

    if (!user) {
      return null;
    }

    return mapUserToSession(user);
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return resolveSessionUser(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getSessionFromRequest(request: NextRequest) {
  return resolveSessionUser(request.cookies.get(SESSION_COOKIE)?.value);
}
