import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { marketingRepository } from "@/server/repositories/marketing.repository";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const { id } = await context.params;
  const body = (await request.json()) as Partial<{
    title: string | null;
    imageUrl: string;
    href: string | null;
    sortOrder: number;
    active: boolean;
  }>;
  await marketingRepository.updateBanner(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const { id } = await context.params;
  await marketingRepository.deleteBanner(id);
  return NextResponse.json({ ok: true });
}
