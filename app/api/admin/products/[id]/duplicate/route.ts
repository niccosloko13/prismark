import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clearActiveProductsCache } from "@/lib/active-products";
import { requireAdminApi } from "@/lib/require-admin-api";
import { storeProductsRepository } from "@/server/repositories/store-products.repository";

export const runtime = "nodejs";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await ctx.params;
  const copy = await storeProductsRepository.duplicate(id);
  if (!copy) {
    return NextResponse.json({ message: "Produto origem não encontrado." }, { status: 404 });
  }

  clearActiveProductsCache();
  return NextResponse.json({ product: copy }, { status: 201 });
}
