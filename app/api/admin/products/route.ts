import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clearActiveProductsCache } from "@/lib/active-products";
import { requireAdminApi } from "@/lib/require-admin-api";
import { storeProductsRepository } from "@/server/repositories/store-products.repository";
import { finalizeStorePayload, storeProductUpsertSchema } from "@/server/validation/store-product";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const products = await storeProductsRepository.listAllNonDeleted();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const parsed = storeProductUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const row = parsed.data;
  const taken = await storeProductsRepository.slugTaken(row.slug, null);
  if (taken) {
    return NextResponse.json({ message: "Slug já em uso por outro produto." }, { status: 409 });
  }

  const payload = finalizeStorePayload(row);
  const created = await storeProductsRepository.insert({
    slug: row.slug,
    isActive: row.isActive,
    featured: row.featured,
    payload,
  });

  clearActiveProductsCache();
  return NextResponse.json({ product: created }, { status: 201 });
}
