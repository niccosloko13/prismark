import { createFallbackProductFromSlug } from "@/lib/catalog";
import { buildProductExperience } from "@/lib/product-experience";
import type { StoreProductMeta, StoreProductPayload } from "@/lib/store-product-payload";

function emptyMeta(): StoreProductMeta {
  return {
    seoTitle: "",
    seoDescription: "",
    headline: "",
    subheadline: "",
    usageTags: [],
    pricingUnit: "m2",
    minimumOrderValue: null,
    allowCustomSize: false,
    customMinWidthCm: 10,
    customMinHeightCm: 10,
    descriptionFull: "",
  };
}

/**
 * Payload inicial para novo produto da loja (vitrine + configurador).
 * `buildProductExperience` roda sem registro prévio de vitrine (API / seed).
 */
export function createDefaultStoreProductPayload(slug: string, name: string, category: string): StoreProductPayload {
  const base = createFallbackProductFromSlug(slug);
  const product = {
    ...base,
    slug,
    name: name.trim() || base.name,
    category: category.trim() || base.category,
    badge: base.badge,
    description: base.description,
    lead: base.lead,
    basePriceM2: base.basePriceM2,
    minimumArea: base.minimumArea,
    minQuantity: base.minQuantity,
    featured: false,
  };
  const experience = buildProductExperience(product);
  return {
    product,
    experience,
    meta: emptyMeta(),
  };
}
