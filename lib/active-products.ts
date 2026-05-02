import { promises as fs } from "node:fs";
import path from "node:path";

import {
  createFallbackProductFromSlug,
  products as catalogProducts,
  setDynamicCatalogFromActiveProducts,
  clearDynamicCatalogFromActiveProducts,
} from "@/lib/catalog";
import {
  setStoreProductExperiences,
  clearStoreProductExperiences,
  type ProductGalleryItem,
} from "@/lib/product-experience";
import { productOverridesRepository, type ProductOverride } from "@/server/repositories/product-overrides.repository";
import {
  activeProductToProduct,
  buildFallbackActiveProduct,
  clearActiveProductSnapshotCache,
  syncActiveProductSnapshotCache,
  type ActiveProduct,
} from "@/lib/active-product-snapshot";
import { storeProductsRepository } from "@/server/repositories/store-products.repository";
import type { Product } from "@/types";

/**
 * Catálogo ativo da loja: **fonte principal** = `store_products` (ativos, não deletados) +
 * produtos por pasta em `public/product` (catálogo estático / imagens), com overrides em `product_overrides`.
 * Se o mesmo slug existir na pasta e no banco, **o registro do banco prevalece** (a pasta é omitida).
 */
export type { ActiveProduct };
export { activeProductToProduct, getActiveProductSnapshotBySlug, hydrateActiveProductSnapshotsFromList } from "@/lib/active-product-snapshot";

const PRODUCT_ROOT = path.join(process.cwd(), "public", "product");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

let cachedActiveProductsPromise: Promise<ActiveProduct[]> | null = null;

export function clearActiveProductsCache() {
  cachedActiveProductsPromise = null;
  clearActiveProductSnapshotCache();
  clearDynamicCatalogFromActiveProducts();
  clearStoreProductExperiences();
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCatalogLookup() {
  const lookup = new Map<string, Product>();

  for (const product of catalogProducts) {
    lookup.set(normalizeKey(product.slug), product);
    lookup.set(normalizeKey(product.name), product);
  }

  return lookup;
}

async function readProductFolders() {
  const entries = await fs.readdir(PRODUCT_ROOT, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function readFolderImages(folderName: string) {
  const folderPath = path.join(PRODUCT_ROOT, folderName);
  const entries = await fs.readdir(folderPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .filter((entry) => IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => `/product/${encodeURIComponent(folderName)}/${encodeURIComponent(entry.name)}`)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

async function buildActiveProducts() {
  const lookup = buildCatalogLookup();
  const folderNames = await readProductFolders();
  const usedSlugs = new Set<string>();
  const result: ActiveProduct[] = [];

  for (const folderName of folderNames) {
    const normalizedFolder = normalizeKey(folderName);
    const slugFromFolder = toSlug(folderName);
    const catalogProduct = lookup.get(normalizedFolder) ?? lookup.get(normalizeKey(slugFromFolder)) ?? null;

    const base = catalogProduct ?? createFallbackProductFromSlug(slugFromFolder || folderName);
    let slug = base.slug;
    let suffix = 2;

    while (usedSlugs.has(slug)) {
      slug = `${base.slug}-${suffix}`;
      suffix += 1;
    }

    usedSlugs.add(slug);
    const imagePaths = await readFolderImages(folderName);

    result.push({
      ...base,
      slug,
      folderName,
      imagePaths,
      primaryImagePath: imagePaths[0] ?? null,
      isCatalogProduct: Boolean(catalogProduct),
      storeProductId: null,
      storeExperience: null,
      storeMeta: null,
    });
  }

  const sorted = result.sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "pt-BR"),
  );

  let overrides: ProductOverride[] = [];
  try {
    overrides = await productOverridesRepository.listAll();
  } catch {
    overrides = [];
  }

  const bySlug = new Map(overrides.map((o) => [o.productSlug, o]));
  const visible = sorted.filter((p) => bySlug.get(p.slug)?.isActive !== false);

  const withOverrides: ActiveProduct[] = visible.map((p) => {
    const o = bySlug.get(p.slug);
    if (!o) {
      return p;
    }
    return {
      ...p,
      basePriceM2: o.basePriceM2 ?? p.basePriceM2,
      featured: o.featured ?? p.featured,
    };
  });

  let storeRows: Awaited<ReturnType<typeof storeProductsRepository.listActiveForStorefront>> = [];
  try {
    storeRows = await storeProductsRepository.listActiveForStorefront();
  } catch {
    storeRows = [];
  }

  const storeSlugKeys = new Set(storeRows.map((r) => r.slug.trim().toLowerCase()));
  const folderAndCatalog = withOverrides.filter((p) => !storeSlugKeys.has(p.slug.trim().toLowerCase()));

  /** Vitória: `store_products` (admin) substitui qualquer item de pasta/catálogo com o mesmo slug. */
  const fromStore: ActiveProduct[] = storeRows.map((row) => {
    const payload = row.payload;
    const paths = (payload.experience.gallery ?? [])
      .map((g: ProductGalleryItem) => g.src)
      .filter(Boolean);
    const mergedProduct: Product = {
      ...payload.product,
      slug: row.slug.trim().toLowerCase(),
      featured: row.featured,
    };
    return {
      ...mergedProduct,
      folderName: `store:${row.id.slice(0, 8)}`,
      imagePaths: paths,
      primaryImagePath: paths[0] ?? null,
      isCatalogProduct: false,
      storeProductId: row.id,
      storeExperience: payload.experience,
      storeMeta: payload.meta,
    };
  });

  const merged = [...fromStore, ...folderAndCatalog].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      Number(Boolean(b.storeProductId)) - Number(Boolean(a.storeProductId)) ||
      a.name.localeCompare(b.name, "pt-BR"),
  );

  syncActiveProductSnapshotCache(merged);
  setDynamicCatalogFromActiveProducts(merged.map(activeProductToProduct));
  /** Sempre registrar experiência persistida para produtos do banco (mapa usado no configurador / carrinho). */
  setStoreProductExperiences(
    merged
      .filter((p) => p.storeProductId && p.storeExperience)
      .map((p) => ({ slug: p.slug.trim().toLowerCase(), experience: p.storeExperience! })),
  );

  return merged;
}

export async function getActiveProducts() {
  if (!cachedActiveProductsPromise) {
    cachedActiveProductsPromise = buildActiveProducts();
  }
  return cachedActiveProductsPromise;
}

export async function getActiveProductBySlug(slug: string): Promise<ActiveProduct | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  const products = await getActiveProducts();
  const hit = products.find((product) => product.slug.trim().toLowerCase() === key);
  if (hit) return hit;
  return buildFallbackActiveProduct(key);
}

export async function getActiveProductSlugs() {
  const products = await getActiveProducts();
  return products.map((product) => product.slug);
}
