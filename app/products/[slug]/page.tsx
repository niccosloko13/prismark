import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductStudio } from "@/components/product/product-studio";
import { getSession } from "@/lib/auth";
import { getActiveProductBySlug, getActiveProducts } from "@/lib/active-products";
import {
  clampCustomDimensions,
  customSizePolicyFromMeta,
  PRISMARQ_CUSTOM_FORMAT_ID,
} from "@/lib/custom-product-size";
import { buildProductExperience, getDefaultSelection, type ProductSelectionState } from "@/lib/product-experience";
import { getPublicImageSrcCandidates } from "@/lib/product-images";
import type { StoreProductMeta } from "@/lib/store-product-payload";
import type { Product } from "@/types";

/** Novos slugs (ex.: `store_products`) sem rebuild; `generateMetadata` continua por requisição. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);

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
  storeMeta,
}: {
  product: Product;
  experience: ReturnType<typeof buildProductExperience>;
  storeMeta?: StoreProductMeta | null;
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
  const formatIdParam = normalizeText(searchParams.formatId);
  const format =
    experience.formats.find((item) => item.id === formatIdParam) ??
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

  const policy = customSizePolicyFromMeta(storeMeta ?? undefined);

  let selection: ProductSelectionState = {
    modelId: model?.id ?? base.modelId,
    formatId: format?.id ?? base.formatId,
    width: positiveNumber(searchParams.width) ?? format?.width ?? base.width,
    height: positiveNumber(searchParams.height) ?? format?.height ?? base.height,
    colorId:
      experience.colors.find((item) => item.id === colorId)?.id ?? model?.colorId ?? base.colorId,
    enhancementId:
      experience.enhancements.find((item) => item.id === enhancementId)?.id ??
      model?.enhancementId ??
      base.enhancementId,
    material:
      product.materials.find((item) => item.label === material)?.label ?? model?.material ?? base.material,
    finishing:
      product.finishings.find((item) => item.label === finishing)?.label ?? model?.finishing ?? base.finishing,
    deadline: product.deadlines.find((item) => item.label === deadline)?.label ?? base.deadline,
    quantity: Math.max(
      positiveNumber(searchParams.quantity) ? Math.round(Number(searchParams.quantity)) : base.quantity,
      product.minQuantity,
    ),
    selectedAddonIds: addonIds,
  };

  if (formatIdParam === PRISMARQ_CUSTOM_FORMAT_ID && policy) {
    const clamped = clampCustomDimensions(selection.width, selection.height, policy);
    selection = {
      ...selection,
      formatId: PRISMARQ_CUSTOM_FORMAT_ID,
      width: clamped.width,
      height: clamped.height,
    };
  } else if (formatIdParam === PRISMARQ_CUSTOM_FORMAT_ID && !policy) {
    selection = {
      ...selection,
      formatId: base.formatId,
      width: base.width,
      height: base.height,
    };
  }

  return {
    selection,
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
  const product = await getActiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const experience = buildProductExperience(product);
  if (product.imagePaths.length > 0 && product.storeProductId == null) {
    experience.gallery = product.imagePaths.map((src, index) => ({
      id: `${product.slug}-folder-${index + 1}`,
      title: `${product.name} ${index + 1}`,
      subtitle: "Imagem do catálogo ativo",
      accent: (index % 3 === 0 ? "cyan" : index % 3 === 1 ? "magenta" : "yellow") as "cyan" | "magenta" | "yellow",
      src,
      srcCandidates: getPublicImageSrcCandidates(src),
    }));
  }

  const activeProducts = await getActiveProducts();
  const relatedProducts = activeProducts
    .filter((item) => item.slug !== product.slug && (item.category === product.category || item.featured))
    .slice(0, 4)
    .map((item) => ({
      product: item,
      imageSrc: item.primaryImagePath,
    }));
  const initialSelection = buildInitialSelection({
    product,
    experience,
    searchParams: resolvedSearchParams,
    storeMeta: "storeMeta" in product ? product.storeMeta : null,
  });

  const session = await getSession();

  return (
    <div className="min-h-screen space-y-4 bg-[#05070d] text-white sm:space-y-5">
      <ProductStudio
        product={product}
        experience={experience}
        customSizePolicy={customSizePolicyFromMeta("storeMeta" in product ? product.storeMeta ?? undefined : undefined)}
        initialSelection={initialSelection.selection}
        editingCartItemId={initialSelection.editingCartItemId}
        cartNotes={initialSelection.notes}
        relatedProducts={relatedProducts}
        initialSession={session}
      />
    </div>
  );
}
