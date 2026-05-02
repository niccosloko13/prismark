import { createFallbackProductFromSlug, products as staticCatalogProducts } from "@/lib/catalog";
import type { ProductExperience } from "@/lib/product-experience";
import type { StoreProductMeta } from "@/lib/store-product-payload";
import type { Product } from "@/types";

/** Produto resolvido para a vitrine (pastas, loja admin, overrides). */
export interface ActiveProduct extends Product {
  folderName: string;
  imagePaths: string[];
  primaryImagePath: string | null;
  isCatalogProduct: boolean;
  storeProductId: string | null;
  storeExperience: ProductExperience | null;
  storeMeta: StoreProductMeta | null;
}

const bySlug = new Map<string, ActiveProduct>();

export function syncActiveProductSnapshotCache(merged: ActiveProduct[]): void {
  bySlug.clear();
  for (const p of merged) {
    bySlug.set(p.slug.trim().toLowerCase(), p);
  }
}

export function clearActiveProductSnapshotCache(): void {
  bySlug.clear();
}

/** Mescla respostas do bridge (cliente) com o cache em memória. */
export function hydrateActiveProductSnapshotsFromList(products: ActiveProduct[]): void {
  for (const p of products) {
    bySlug.set(p.slug.trim().toLowerCase(), p);
  }
}

export function buildFallbackActiveProduct(slugKey: string): ActiveProduct {
  const staticMatch = staticCatalogProducts.find((p) => p.slug === slugKey);
  const base = staticMatch ?? createFallbackProductFromSlug(slugKey);
  return {
    ...base,
    folderName: `fallback:${slugKey}`,
    imagePaths: [],
    primaryImagePath: null,
    isCatalogProduct: Boolean(staticMatch),
    storeProductId: null,
    storeExperience: null,
    storeMeta: null,
  };
}

/**
 * Leitura síncrona (carrinho, pricing, experiência) alinhada ao catálogo ativo.
 * Usa snapshot preenchido após `getActiveProducts` no servidor ou após o bridge no cliente.
 * Slug vazio → null; caso contrário há fallback seguro (catálogo estático ou stub).
 */
export function getActiveProductSnapshotBySlug(slug: string): ActiveProduct | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  return bySlug.get(key) ?? buildFallbackActiveProduct(key);
}

export function activeProductToProduct(p: ActiveProduct): Product {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    badge: p.badge,
    description: p.description,
    lead: p.lead,
    basePriceM2: p.basePriceM2,
    minimumArea: p.minimumArea,
    minQuantity: p.minQuantity,
    materials: p.materials,
    finishings: p.finishings,
    deadlines: p.deadlines,
    applications: p.applications,
    deliveryNote: p.deliveryNote,
    featured: p.featured,
  };
}
