import type { ProductExperience } from "@/lib/product-experience";
import type { Product } from "@/types";

export type StorePricingUnit = "m2" | "unit" | "package";

export interface StoreProductMeta {
  seoTitle: string;
  seoDescription: string;
  headline: string;
  subheadline: string;
  usageTags: string[];
  pricingUnit: StorePricingUnit;
  /** Valor mínimo do pedido (R$), opcional. */
  minimumOrderValue: number | null;
  allowCustomSize: boolean;
  customMinWidthCm: number | null;
  customMinHeightCm: number | null;
  /** Descrição longa (HTML/markdown livre no futuro). */
  descriptionFull: string;
}

export interface StoreProductPayload {
  product: Product;
  experience: ProductExperience;
  meta: StoreProductMeta;
}

export interface StoreProductRow {
  id: string;
  slug: string;
  isActive: boolean;
  featured: boolean;
  deletedAt: string | null;
  payload: StoreProductPayload;
  createdAt: string;
  updatedAt: string;
}
