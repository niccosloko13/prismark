import { z } from "zod";

import { isStaticCatalogSlug } from "@/lib/catalog";
import type { StoreProductPayload } from "@/lib/store-product-payload";

const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  badge: z.string(),
  description: z.string(),
  lead: z.string(),
  basePriceM2: z.number().positive(),
  minimumArea: z.number().nonnegative(),
  minQuantity: z.number().int().min(1),
  materials: z
    .array(
      z.object({
        label: z.string().min(1),
        multiplier: z.number(),
        description: z.string(),
      }),
    )
    .min(1),
  finishings: z
    .array(
      z.object({
        label: z.string().min(1),
        fee: z.number().nonnegative(),
        description: z.string(),
        type: z.enum(["perOrder", "perUnit"]),
      }),
    )
    .min(1),
  deadlines: z
    .array(
      z.object({
        label: z.string().min(1),
        days: z.number().int().min(1),
        multiplier: z.number().positive(),
      }),
    )
    .min(1),
  applications: z.array(z.string()),
  deliveryNote: z.string(),
  featured: z.boolean(),
});

const metaSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  usageTags: z.array(z.string()),
  pricingUnit: z.enum(["m2", "unit", "package"]),
  minimumOrderValue: z.number().nonnegative().nullable(),
  allowCustomSize: z.boolean(),
  customMinWidthCm: z.number().nullable(),
  customMinHeightCm: z.number().nullable(),
  descriptionFull: z.string(),
});

export const storeProductUpsertSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.")
      .transform((s) => s.trim().toLowerCase()),
    isActive: z.boolean(),
    featured: z.boolean(),
    payload: z.object({
      product: productSchema,
      experience: z.unknown(),
      meta: metaSchema,
    }),
  })
  .superRefine((row, ctx) => {
    if (isStaticCatalogSlug(row.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Este slug pertence ao catálogo estático. Escolha outro.",
        path: ["slug"],
      });
    }
    if (row.payload.product.slug.trim().toLowerCase() !== row.slug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O slug interno do produto precisa coincidir com o slug principal.",
        path: ["payload", "product", "slug"],
      });
    }
    const exp = row.payload.experience as { gallery?: unknown[]; formats?: unknown[] } | null;
    const gallery = exp?.gallery;
    const hasImage =
      Array.isArray(gallery) &&
      gallery.some((item) => {
        if (!item || typeof item !== "object" || !("src" in item)) return false;
        const src = String((item as { src?: string }).src ?? "").trim();
        return src.length > 0;
      });
    if (!hasImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inclua ao menos uma imagem (URL, caminho /images/... ou galeria gerada).",
        path: ["payload", "experience", "gallery"],
      });
    }
    const formats = exp?.formats;
    if (!Array.isArray(formats) || formats.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cadastre ao menos um tamanho (largura × altura).",
        path: ["payload", "experience", "formats"],
      });
    }
    if (row.payload.meta.allowCustomSize) {
      const w = row.payload.meta.customMinWidthCm ?? 0;
      const h = row.payload.meta.customMinHeightCm ?? 0;
      if (w <= 0 || h <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Defina largura e altura mínimas (cm) para tamanho personalizado.",
          path: ["payload", "meta", "customMinWidthCm"],
        });
      }
    }
  });

export type StoreProductUpsertInput = z.infer<typeof storeProductUpsertSchema>;

export function finalizeStorePayload(input: StoreProductUpsertInput): StoreProductPayload {
  return {
    product: {
      ...input.payload.product,
      slug: input.slug,
      featured: input.featured,
    },
    experience: input.payload.experience as StoreProductPayload["experience"],
    meta: input.payload.meta,
  };
}
