import { promises as fs } from "node:fs";
import path from "node:path";

import { createFallbackProductFromSlug, products as catalogProducts } from "@/lib/catalog";
import { productOverridesRepository, type ProductOverride } from "@/server/repositories/product-overrides.repository";
import type { Product } from "@/types";

const PRODUCT_ROOT = path.join(process.cwd(), "public", "product");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export interface ActiveProduct extends Product {
  folderName: string;
  imagePaths: string[];
  primaryImagePath: string | null;
  isCatalogProduct: boolean;
}

let cachedActiveProductsPromise: Promise<ActiveProduct[]> | null = null;

export function clearActiveProductsCache() {
  cachedActiveProductsPromise = null;
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

  return visible.map((p) => {
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
}

export async function getActiveProducts() {
  if (!cachedActiveProductsPromise) {
    cachedActiveProductsPromise = buildActiveProducts();
  }
  return cachedActiveProductsPromise;
}

export async function getActiveProductBySlug(slug: string) {
  const products = await getActiveProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getActiveProductSlugs() {
  const products = await getActiveProducts();
  return products.map((product) => product.slug);
}
