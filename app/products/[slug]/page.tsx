import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductStudio } from "@/components/product/product-studio";
import { buildProductExperience, getDefaultSelection, type ProductSelectionState } from "@/lib/product-experience";
import { getProductBySlug, products } from "@/lib/catalog";

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Prismarq Comunicação Visual",
    };
  }

  return {
    title: `${product.name} | Prismarq Comunicação Visual`,
    description: product.description,
  };
}

function positiveNumber(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeText(value?: string) {
  const text = value?.trim();
  return text && text.length > 0 ? text : undefined;
}

function buildInitialSelection({
  product,
  experience,
  searchParams,
}: {
  product: NonNullable<ReturnType<typeof getProductBySlug>>;
  experience: ReturnType<typeof buildProductExperience>;
  searchParams: {
    cartItem?: string;
    modelId?: string;
    formatId?: string;
    width?: string;
    height?: string;
    quantity?: string;
    colorId?: string;
    enhancementId?: string;
    material?: string;
    finishing?: string;
    deadline?: string;
    addons?: string;
    notes?: string;
  };
}): { selection: ProductSelectionState; editingCartItemId: string | null; notes: string } {
  const base = getDefaultSelection(product, experience);
  const modelId = normalizeText(searchParams.modelId);
  const model =
    experience.models.find((item) => item.id === modelId) ??
    experience.models.find((item) => item.id === base.modelId) ??
    experience.models[0];
  const formatId = normalizeText(searchParams.formatId);
  const format =
    experience.formats.find((item) => item.id === formatId) ??
    experience.formats.find((item) => item.id === model?.formatId) ??
    experience.formats.find((item) => item.id === base.formatId) ??
    experience.formats[0];
  const colorId = normalizeText(searchParams.colorId);
  const enhancementId = normalizeText(searchParams.enhancementId);
  const material = normalizeText(searchParams.material);
  const finishing = normalizeText(searchParams.finishing);
  const deadline = normalizeText(searchParams.deadline);
  const addonIds = normalizeText(searchParams.addons)
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((addonId) => experience.addons.some((item) => item.id === addonId)) ?? [];

  return {
    selection: {
      modelId: model?.id ?? base.modelId,
      formatId: format?.id ?? base.formatId,
      width: positiveNumber(searchParams.width) ?? format?.width ?? base.width,
      height: positiveNumber(searchParams.height) ?? format?.height ?? base.height,
      colorId:
        experience.colors.find((item) => item.id === colorId)?.id ??
        model?.colorId ??
        base.colorId,
      enhancementId:
        experience.enhancements.find((item) => item.id === enhancementId)?.id ??
        model?.enhancementId ??
        base.enhancementId,
      material:
        product.materials.find((item) => item.label === material)?.label ??
        model?.material ??
        base.material,
      finishing:
        product.finishings.find((item) => item.label === finishing)?.label ??
        model?.finishing ??
        base.finishing,
      deadline:
        product.deadlines.find((item) => item.label === deadline)?.label ??
        base.deadline,
      quantity: Math.max(positiveNumber(searchParams.quantity) ? Math.round(Number(searchParams.quantity)) : base.quantity, product.minQuantity),
      selectedAddonIds: addonIds,
    },
    editingCartItemId: normalizeText(searchParams.cartItem) ?? null,
    notes: normalizeText(searchParams.notes) ?? "",
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    cartItem?: string;
    modelId?: string;
    formatId?: string;
    width?: string;
    height?: string;
    quantity?: string;
    colorId?: string;
    enhancementId?: string;
    material?: string;
    finishing?: string;
    deadline?: string;
    addons?: string;
    notes?: string;
  }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const experience = buildProductExperience(product);
  const initialSelection = buildInitialSelection({
    product,
    experience,
    searchParams: resolvedSearchParams,
  });

  return (
    <div className="space-y-6">
      <ProductStudio
        product={product}
        experience={experience}
        initialSelection={initialSelection.selection}
        editingCartItemId={initialSelection.editingCartItemId}
        cartNotes={initialSelection.notes}
      />
    </div>
  );
}
