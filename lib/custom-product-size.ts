import type { StoreProductMeta } from "@/lib/store-product-payload";

/** ID reservado de formato para medidas livres (produtos `store_products` com `allowCustomSize`). */
export const PRISMARQ_CUSTOM_FORMAT_ID = "__prismarq_custom_size__";

/** Piso absoluto de medida (cm) para tamanho personalizado na vitrine. */
export const CUSTOM_SIZE_ABS_MIN_CM = 10;

export type CustomSizePolicy = {
  minWidthCm: number;
  minHeightCm: number;
};

export function customSizePolicyFromMeta(
  meta: Pick<StoreProductMeta, "allowCustomSize" | "customMinWidthCm" | "customMinHeightCm"> | null | undefined,
): CustomSizePolicy | null {
  if (!meta?.allowCustomSize) return null;
  return {
    minWidthCm: Math.max(CUSTOM_SIZE_ABS_MIN_CM, meta.customMinWidthCm ?? CUSTOM_SIZE_ABS_MIN_CM),
    minHeightCm: Math.max(CUSTOM_SIZE_ABS_MIN_CM, meta.customMinHeightCm ?? CUSTOM_SIZE_ABS_MIN_CM),
  };
}

export function isCustomFormatId(formatId: string): boolean {
  return formatId === PRISMARQ_CUSTOM_FORMAT_ID;
}

const CUSTOM_SIZE_MAX_CM = 1200;

export function clampCustomDimensions(
  widthCm: number,
  heightCm: number,
  policy: CustomSizePolicy,
): { width: number; height: number } {
  const w = Number.isFinite(widthCm) && widthCm > 0 ? widthCm : policy.minWidthCm;
  const h = Number.isFinite(heightCm) && heightCm > 0 ? heightCm : policy.minHeightCm;
  return {
    width: Math.min(CUSTOM_SIZE_MAX_CM, Math.max(policy.minWidthCm, Math.round(w * 100) / 100)),
    height: Math.min(CUSTOM_SIZE_MAX_CM, Math.max(policy.minHeightCm, Math.round(h * 100) / 100)),
  };
}

/** Texto curto para chips de resumo (barra fixa, carrinho). */
export function formatSizeSummaryForSelection(selection: { formatId: string; width: number; height: number }): string {
  if (isCustomFormatId(selection.formatId)) {
    return `Tamanho personalizado: ${selection.width}x${selection.height}cm`;
  }
  return `${selection.width}×${selection.height} cm`;
}
