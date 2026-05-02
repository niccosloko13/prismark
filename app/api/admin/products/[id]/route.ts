import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { clearActiveProductsCache } from "@/lib/active-products";
import { requireAdminApi } from "@/lib/require-admin-api";
import { storeProductsRepository } from "@/server/repositories/store-products.repository";
import { finalizeStorePayload, storeProductUpsertSchema } from "@/server/validation/store-product";

export const runtime = "nodejs";

const patchSchema = z
  .object({
    isActive: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => typeof v.isActive === "boolean" || typeof v.featured === "boolean", {
    message: "Informe isActive ou featured.",
  });

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await ctx.params;
  const product = await storeProductsRepository.getById(id);
  if (!product) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await ctx.params;
  const existing = await storeProductsRepository.getById(id);
  if (!existing) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
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
  const taken = await storeProductsRepository.slugTaken(row.slug, id);
  if (taken) {
    return NextResponse.json({ message: "Slug já em uso por outro produto." }, { status: 409 });
  }

  const payload = finalizeStorePayload(row);
  const updated = await storeProductsRepository.update(id, {
    slug: row.slug,
    isActive: row.isActive,
    featured: row.featured,
    payload,
  });

  if (!updated) {
    return NextResponse.json({ message: "Não foi possível atualizar." }, { status: 400 });
  }

  clearActiveProductsCache();
  return NextResponse.json({ product: updated });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await ctx.params;
  const existing = await storeProductsRepository.getById(id);
  if (!existing) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await storeProductsRepository.patchFlags(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ message: "Não foi possível atualizar." }, { status: 400 });
  }

  clearActiveProductsCache();
  return NextResponse.json({ product: updated });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await ctx.params;
  const ok = await storeProductsRepository.softDelete(id);
  if (!ok) {
    return NextResponse.json({ message: "Produto não encontrado ou já removido." }, { status: 404 });
  }

  clearActiveProductsCache();
  return NextResponse.json({ ok: true });
}
