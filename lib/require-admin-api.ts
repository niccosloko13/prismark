import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import type { SessionUser } from "@/types";

export async function requireAdminApi(request: NextRequest): Promise<SessionUser | NextResponse> {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }
  return session;
}
