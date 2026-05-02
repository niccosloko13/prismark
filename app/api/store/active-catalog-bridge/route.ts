import { NextResponse } from "next/server";

import { activeProductToProduct, getActiveProducts } from "@/lib/active-products";

export const runtime = "nodejs";

/** Sincroniza catálogo ativo (incl. produtos admin) no cliente para carrinho e cotações. */
export async function GET() {
  const list = await getActiveProducts();
  const products = list.map(activeProductToProduct);
  const storeExperiences = list
    .filter((p) => p.storeExperience)
    .map((p) => ({ slug: p.slug, experience: p.storeExperience! }));

  return NextResponse.json({ products, storeExperiences, activeProducts: list });
}
