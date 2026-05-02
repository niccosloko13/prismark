import { z } from "zod";

import { activeProductToProduct, getActiveProductSnapshotBySlug } from "@/lib/active-product-snapshot";
import { isCustomFormatId } from "@/lib/custom-product-size";
import { calculateQuoteForProduct } from "@/lib/pricing";
import {
  buildSelectionNotes,
  getProductExperience,
  getDefaultSelection,
  getAddonsFeeTotalBrl,
  getSelectedAddons,
  getSelectedColor,
  getSelectedEnhancement,
  getSelectedFormat,
  getSelectedModel,
  type ProductExperience,
  type ProductSelectionState,
} from "@/lib/product-experience";
import { roundTo } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

const cartAddonSchema = z.object({
  id: z.string(),
  label: z.string(),
  priceLabel: z.string(),
  highlighted: z.boolean().optional(),
});

const cartSelectionSchema = z.object({
  modelId: z.string(),
  formatId: z.string(),
  width: z.number(),
  height: z.number(),
  colorId: z.string(),
  enhancementId: z.string(),
  material: z.string(),
  finishing: z.string(),
  deadline: z.string(),
  quantity: z.number(),
  selectedAddonIds: z.array(z.string()),
});

const cartItemSchema = z.object({
  id: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  productCategory: z.string(),
  productBadge: z.string(),
  image: z.string(),
  selection: cartSelectionSchema,
  addons: z.array(cartAddonSchema),
  notes: z.string().nullable().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  summary: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  productSnapshot: z.any().optional(),
});

const cartItemsSchema = z.array(cartItemSchema);

function createCartId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function positiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : undefined;
}

function buildSelectionFromQuery({
  product,
  experience,
  params,
}: {
  product: Product;
  experience: ProductExperience;
  params: Record<string, string | undefined>;
}): { selection: ProductSelectionState; notes: string; editingCartItemId: string | null } {
  const base = getDefaultSelection(product, experience);
  const modelFromQuery = normalizeText(params.modelId);
  const model =
    experience.models.find((item) => item.id === modelFromQuery) ??
    experience.models.find((item) => item.id === base.modelId) ??
    experience.models[0];
  const formatFromQuery = normalizeText(params.formatId);
  const format =
    experience.formats.find((item) => item.id === formatFromQuery) ??
    experience.formats.find((item) => item.id === model?.formatId) ??
    experience.formats.find((item) => item.id === base.formatId) ??
    experience.formats[0];
  const materialFromQuery = normalizeText(params.material);
  const finishingFromQuery = normalizeText(params.finishing);
  const deadlineFromQuery = normalizeText(params.deadline);
  const colorFromQuery = normalizeText(params.colorId);
  const enhancementFromQuery = normalizeText(params.enhancementId);

  const selectedAddonIds = (normalizeText(params.addons) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((addonId) => experience.addons.some((item) => item.id === addonId));

  const selection: ProductSelectionState = {
    modelId: model?.id ?? base.modelId,
    formatId: format?.id ?? base.formatId,
    width: positiveNumber(params.width) ?? format?.width ?? base.width,
    height: positiveNumber(params.height) ?? format?.height ?? base.height,
    colorId:
      experience.colors.find((item) => item.id === colorFromQuery)?.id ??
      model?.colorId ??
      base.colorId,
    enhancementId:
      experience.enhancements.find((item) => item.id === enhancementFromQuery)?.id ??
      model?.enhancementId ??
      base.enhancementId,
    material:
      product.materials.find((item) => item.label === materialFromQuery)?.label ??
      model?.material ??
      base.material,
    finishing:
      product.finishings.find((item) => item.label === finishingFromQuery)?.label ??
      model?.finishing ??
      base.finishing,
    deadline:
      product.deadlines.find((item) => item.label === deadlineFromQuery)?.label ??
      base.deadline,
    quantity: Math.max(Math.round(positiveNumber(params.quantity) ?? base.quantity), product.minQuantity),
    selectedAddonIds,
  };

  return {
    selection,
    notes: normalizeText(params.notes) ?? "",
    editingCartItemId: normalizeText(params.cartItem) ?? null,
  };
}

export function resolveCartSelectionFromQuery({
  product,
  experience,
  params,
}: {
  product: Product;
  experience: ProductExperience;
  params: Record<string, string | undefined>;
}) {
  return buildSelectionFromQuery({ product, experience, params });
}

export function resolveProductFromCartItem(item: CartItem): Product | null {
  if (item.productSnapshot) {
    return item.productSnapshot;
  }
  const active = getActiveProductSnapshotBySlug(item.productSlug);
  return active ? activeProductToProduct(active) : null;
}

export function buildCartItem({
  product,
  experience,
  selection,
  image,
  notes,
}: {
  product: Product;
  experience: ProductExperience;
  selection: ProductSelectionState;
  image?: string;
  notes?: string;
}): CartItem {
  const quote = calculateQuoteForProduct(product, {
    width: selection.width,
    height: selection.height,
    quantity: selection.quantity,
    material: selection.material,
    finishing: selection.finishing,
    deadline: selection.deadline,
    addonsTotal: getAddonsFeeTotalBrl(experience, selection),
  });

  const selectedModel = getSelectedModel(experience, selection);
  const selectedFormat = getSelectedFormat(experience, selection);
  const selectedColor = getSelectedColor(experience, selection);
  const selectedEnhancement = getSelectedEnhancement(experience, selection);
  const selectedAddons = getSelectedAddons(experience, selection);
  const activeImage = image ?? experience.gallery[0]?.src ?? "";
  const createdAt = new Date().toISOString();

  return {
    id: createCartId(),
    productSlug: product.slug,
    productName: product.name,
    productCategory: product.category,
    productBadge: product.badge,
    image: activeImage,
    selection: {
      modelId: selection.modelId,
      formatId: selection.formatId,
      width: selection.width,
      height: selection.height,
      colorId: selection.colorId,
      enhancementId: selection.enhancementId,
      material: selection.material,
      finishing: selection.finishing,
      deadline: selection.deadline,
      quantity: selection.quantity,
      selectedAddonIds: [...selection.selectedAddonIds],
    },
    addons: selectedAddons.map((addon) => ({
      id: addon.id,
      label: addon.label,
      priceLabel: addon.priceLabel,
      highlighted: addon.highlighted,
    })),
    notes: normalizeText(notes) ?? null,
    quantity: selection.quantity,
    productSnapshot: product,
    unitPrice: roundTo(quote.total / selection.quantity),
    totalPrice: quote.total,
    summary: [
      selectedModel?.label,
      selectedFormat
        ? isCustomFormatId(selection.formatId)
          ? `Tamanho personalizado: ${selection.width}x${selection.height}cm`
          : `${selectedFormat.label} · ${selection.width} x ${selection.height} cm`
        : null,
      selectedColor?.label,
      selectedEnhancement?.label,
    ]
      .filter(Boolean)
      .join(" · "),
    createdAt,
    updatedAt: createdAt,
  };
}

export function buildCartEditUrl(item: CartItem) {
  const params = new URLSearchParams();
  params.set("cartItem", item.id);
  params.set("modelId", item.selection.modelId);
  params.set("formatId", item.selection.formatId);
  params.set("width", String(item.selection.width));
  params.set("height", String(item.selection.height));
  params.set("quantity", String(item.selection.quantity));
  params.set("colorId", item.selection.colorId);
  params.set("enhancementId", item.selection.enhancementId);
  params.set("material", item.selection.material);
  params.set("finishing", item.selection.finishing);
  params.set("deadline", item.selection.deadline);

  if (item.selection.selectedAddonIds.length > 0) {
    params.set("addons", item.selection.selectedAddonIds.join(","));
  }

  if (item.notes) {
    params.set("notes", item.notes);
  }

  return `/products/${item.productSlug}?${params.toString()}`;
}

export function buildCartOrderNotes(item: CartItem) {
  const product = resolveProductFromCartItem(item);
  const experience = product ? getProductExperience(product.slug) : null;

  if (!product || !experience) {
    return item.notes?.trim() ?? "";
  }

  const selectionNotes = buildSelectionNotes(product, experience, item.selection);
  return [item.notes?.trim(), selectionNotes].filter(Boolean).join("\n\n");
}

export function loadCartItems(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return cartItemsSchema.parse(parsed);
  } catch {
    return [];
  }
}

export function normalizeCartItems(items: unknown) {
  try {
    return cartItemsSchema.parse(items);
  } catch {
    return [];
  }
}

export function serializeCartItems(items: CartItem[]) {
  return JSON.stringify(items);
}
