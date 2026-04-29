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
  const items = await marketingRepository.listFeaturedAll();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const body = (await request.json()) as { productSlug?: string; sortOrder?: number };
  const slug = body.productSlug?.trim();
  if (!slug) {
    return NextResponse.json({ message: "productSlug obrigatório." }, { status: 400 });
  }
  const id = await marketingRepository.addFeatured(slug, body.sortOrder ?? 0);
  return NextResponse.json({ id });
}
