import type { StoreProductMeta } from "@/lib/store-product-payload";

/** ID reservado de formato para medidas livres. */
export const PRISMARQ_CUSTOM_FORMAT_ID = "__prismarq_custom_size__";

/** Piso absoluto de medida (cm) para tamanho personalizado na vitrine. */
export const CUSTOM_SIZE_ABS_MIN_CM = 0.01;
export const CUSTOM_SIZE_MAX_CM = 1200;

export type CustomSizeUnit = "cm" | "m";

export type CustomSizePolicy = {
  minWidthCm: number;
  minHeightCm: number;
};

export function customSizePolicyFromMeta(
  meta: Pick<StoreProductMeta, "allowCustomSize" | "customMinWidthCm" | "customMinHeightCm"> | null | undefined,
): CustomSizePolicy {
  return {
    minWidthCm: Math.max(CUSTOM_SIZE_ABS_MIN_CM, meta?.customMinWidthCm ?? CUSTOM_SIZE_ABS_MIN_CM),
    minHeightCm: Math.max(CUSTOM_SIZE_ABS_MIN_CM, meta?.customMinHeightCm ?? CUSTOM_SIZE_ABS_MIN_CM),
  };
}

export function isCustomFormatId(formatId: string): boolean {
  return formatId === PRISMARQ_CUSTOM_FORMAT_ID;
}

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

export function customUnitToCm(value: number, unit: CustomSizeUnit): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return unit === "m" ? value * 100 : value;
}

export function cmToCustomUnit(valueCm: number, unit: CustomSizeUnit): number {
  if (!Number.isFinite(valueCm) || valueCm <= 0) return 0;
  return unit === "m" ? Math.round((valueCm / 100) * 1000) / 1000 : Math.round(valueCm * 100) / 100;
}

export function normalizeCustomSizeUnit(value: unknown): CustomSizeUnit {
  return value === "m" ? "m" : "cm";
}

function parseLocalizedNumber(value: string): number {
  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dimensionToCm(value: number, unit: string | undefined): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (unit === "m") return value * 100;
  if (unit === "mm") return value / 10;
  return value;
}

export type ParsedCustomSize = {
  widthCm: number;
  heightCm: number;
  unit: CustomSizeUnit;
};

export function parseCustomSizeText(value: unknown): ParsedCustomSize | null {
  if (typeof value !== "string") return null;

  const text = value
    .trim()
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/\*/g, "x")
    .replace(/\s+/g, " ");

  if (!text) return null;

  const match = text.match(
    /(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*x\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?/,
  );

  if (!match) return null;

  const widthValue = parseLocalizedNumber(match[1] ?? "");
  const heightValue = parseLocalizedNumber(match[3] ?? "");
  const sharedUnit = match[4] ?? match[2] ?? "cm";
  const widthUnit = match[2] ?? sharedUnit;
  const heightUnit = match[4] ?? sharedUnit;
  const widthCm = Math.round(dimensionToCm(widthValue, widthUnit) * 100) / 100;
  const heightCm = Math.round(dimensionToCm(heightValue, heightUnit) * 100) / 100;

  if (widthCm <= 0 || heightCm <= 0) return null;

  return {
    widthCm,
    heightCm,
    unit: sharedUnit === "m" ? "m" : "cm",
  };
}

export function formatCustomDimension(valueCm: number, unit: CustomSizeUnit): string {
  const value = cmToCustomUnit(valueCm, unit);
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: unit === "m" ? 3 : 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCustomSizeLabel(selection: {
  width: number;
  height: number;
  customSizeUnit?: CustomSizeUnit;
}): string {
  const unit = normalizeCustomSizeUnit(selection.customSizeUnit);
  return `Tamanho personalizado: ${formatCustomDimension(selection.width, unit)} x ${formatCustomDimension(selection.height, unit)} ${unit}`;
}

/** Texto curto para chips de resumo (barra fixa, carrinho). */
export function formatSizeSummaryForSelection(selection: {
  formatId: string;
  width: number;
  height: number;
  customSizeUnit?: CustomSizeUnit;
}): string {
  if (isCustomFormatId(selection.formatId)) {
    return formatCustomSizeLabel(selection);
  }
  return `${selection.width} x ${selection.height} cm`;
}
