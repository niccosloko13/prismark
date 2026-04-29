import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAdminDashboardMetrics } from "@/lib/admin-metrics";
import { requireAdminApi } from "@/lib/require-admin-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const metrics = await getAdminDashboardMetrics();
  return NextResponse.json({ metrics });
}
