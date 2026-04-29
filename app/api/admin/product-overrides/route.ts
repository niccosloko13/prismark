import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clearActiveProductsCache } from "@/lib/active-products";
import { requireAdminApi } from "@/lib/require-admin-api";
import { productOverridesRepository } from "@/server/repositories/product-overrides.repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const overrides = await productOverridesRepository.listAll();
  return NextResponse.json({ overrides });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const body = (await request.json()) as {
    productSlug?: string;
    isActive?: boolean;
    basePriceM2?: number | null;
    featured?: boolean | null;
  };

  const slug = body.productSlug?.trim();
  if (!slug) {
    return NextResponse.json({ message: "productSlug obrigatório." }, { status: 400 });
  }

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ message: "isActive obrigatório." }, { status: 400 });
  }

  await productOverridesRepository.upsert({
    productSlug: slug,
    isActive: body.isActive,
    basePriceM2: body.basePriceM2 ?? null,
    featured: body.featured ?? null,
  });

  clearActiveProductsCache();
  const overrides = await productOverridesRepository.listAll();
  return NextResponse.json({ overrides });
}
