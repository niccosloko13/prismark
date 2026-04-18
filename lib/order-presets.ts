import type { Product } from "@/types";

export interface OrderDraftValues {
  width?: number;
  height?: number;
  quantity?: number;
  material?: string;
  finishing?: string;
  deadline?: string;
  notes?: string;
}

export const defaultMeasuresByProduct = {
  banner: { width: 100, height: 150 },
  faixa: { width: 300, height: 70 },
  adesivo: { width: 120, height: 120 },
  cartao: { width: 9, height: 5 },
  lona: { width: 300, height: 200 },
  "wind-banner": { width: 75, height: 200 },
  "placa-pvc": { width: 60, height: 40 },
  "placa-acm": { width: 100, height: 60 },
  backdrop: { width: 300, height: 300 },
  "banner-tecido": { width: 100, height: 150 },
  folheto: { width: 10, height: 14 },
  "adesivo-perfurado": { width: 100, height: 100 },
  totem: { width: 39, height: 195 },
  folder: { width: 20, height: 14 },
  "faixa-impressa": { width: 400, height: 80 },
} as const;

export function getDefaultMeasuresForProduct(productOrSlug: Product | string) {
  const slug = typeof productOrSlug === "string" ? productOrSlug : productOrSlug.slug;
  return defaultMeasuresByProduct[slug as keyof typeof defaultMeasuresByProduct] ?? {
    width: 100,
    height: 100,
  };
}

export function getPreferredDeadlineLabel(product: Product) {
  return product.deadlines[1]?.label ?? product.deadlines[0]?.label ?? "";
}

export function resolveOrderDraft(product: Product, draft: OrderDraftValues = {}) {
  const defaults = getDefaultMeasuresForProduct(product);

  const width = Number.isFinite(draft.width ?? NaN) && Number(draft.width) > 0 ? Number(draft.width) : defaults.width;
  const height =
    Number.isFinite(draft.height ?? NaN) && Number(draft.height) > 0 ? Number(draft.height) : defaults.height;
  const quantity =
    Number.isFinite(draft.quantity ?? NaN) && Number(draft.quantity) > 0
      ? Math.max(Math.round(Number(draft.quantity)), product.minQuantity)
      : product.minQuantity;

  const material = product.materials.some((item) => item.label === draft.material)
    ? (draft.material as string)
    : product.materials[0]?.label ?? "";

  const finishing = product.finishings.some((item) => item.label === draft.finishing)
    ? (draft.finishing as string)
    : product.finishings[0]?.label ?? "";

  const deadline = product.deadlines.some((item) => item.label === draft.deadline)
    ? (draft.deadline as string)
    : getPreferredDeadlineLabel(product);

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
    quantity,
    material,
    finishing,
    deadline,
    notes: draft.notes?.trim() ?? "",
  };
}
