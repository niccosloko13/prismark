import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { marketingRepository } from "@/server/repositories/marketing.repository";
import type { CouponRecord } from "@/server/repositories/marketing.repository";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const { id } = await context.params;
  const body = (await request.json()) as Partial<{
    code: string;
    discountType: CouponRecord["discountType"];
    discountValue: number;
    active: boolean;
    maxUses: number | null;
    validFrom: string | null;
    validUntil: string | null;
  }>;
  await marketingRepository.updateCoupon(id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const { id } = await context.params;
  await marketingRepository.deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
