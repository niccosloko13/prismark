import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { marketingRepository } from "@/server/repositories/marketing.repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const items = await marketingRepository.listCoupons();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const body = (await request.json()) as {
    code?: string;
    discountType?: "percent" | "fixed";
    discountValue?: number;
    active?: boolean;
    maxUses?: number | null;
    validFrom?: string | null;
    validUntil?: string | null;
  };
  if (!body.code?.trim() || !body.discountType || body.discountValue == null) {
    return NextResponse.json({ message: "code, discountType e discountValue obrigatórios." }, { status: 400 });
  }
  const id = await marketingRepository.addCoupon({
    code: body.code,
    discountType: body.discountType,
    discountValue: body.discountValue,
    active: body.active,
    maxUses: body.maxUses,
    validFrom: body.validFrom,
    validUntil: body.validUntil,
  });
  return NextResponse.json({ id });
}
