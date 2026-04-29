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
  const items = await marketingRepository.listBannersAll();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }
  const body = (await request.json()) as {
    title?: string | null;
    imageUrl?: string;
    href?: string | null;
    sortOrder?: number;
    active?: boolean;
  };
  if (!body.imageUrl?.trim()) {
    return NextResponse.json({ message: "imageUrl obrigatório." }, { status: 400 });
  }
  const id = await marketingRepository.addBanner({
    title: body.title,
    imageUrl: body.imageUrl.trim(),
    href: body.href,
    sortOrder: body.sortOrder ?? 0,
    active: body.active,
  });
  return NextResponse.json({ id });
}
