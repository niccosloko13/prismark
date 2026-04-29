"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/common/product-card";
import { products } from "@/lib/catalog";
import { calculateQuote } from "@/lib/pricing";
import {
  getAddonsFeeTotalBrl,
  getDefaultSelection,
  type ProductExperience,
  type ProductSelectionState,
} from "@/lib/product-experience";
import type { Product } from "@/types";

import { ProductAddonStrip } from "./product-addon-strip";
import { ProductHeroPanel } from "./product-hero-panel";
import { ProductPurchasePanel } from "./product-purchase-panel";
import {
  ProductGallery,
  ProductSpecs,
  TemplateDownloads,
} from "./product-sections";
import { ProductSummaryPanel } from "./product-summary-panel";

function toggleAddon(selection: ProductSelectionState, addonId: string) {
  return selection.selectedAddonIds.includes(addonId)
    ? selection.selectedAddonIds.filter((item) => item !== addonId)
    : [...selection.selectedAddonIds, addonId];
}

export function ProductStudio({
  product,
  experience,
  initialSelection,
  editingCartItemId,
  cartNotes,
}: {
  product: Product;
  experience: ProductExperience;
  initialSelection?: ProductSelectionState;
  editingCartItemId?: string | null;
  cartNotes?: string;
}) {
  const [activeGalleryId, setActiveGalleryId] = useState(experience.gallery[0]?.id ?? "");
  const [selection, setSelection] = useState<ProductSelectionState>(
    () => initialSelection ?? getDefaultSelection(product, experience),
  );

  useEffect(() => {
    setActiveGalleryId(experience.gallery[0]?.id ?? "");
    setSelection(initialSelection ?? getDefaultSelection(product, experience));
  }, [experience, product, initialSelection]);

  const quote = calculateQuote({
    productSlug: product.slug,
    width: selection.width,
    height: selection.height,
    quantity: selection.quantity,
    material: selection.material,
    finishing: selection.finishing,
    deadline: selection.deadline,
    addonsTotal: getAddonsFeeTotalBrl(experience, selection),
  });
  const selectedAddons = useMemo(
    () =>
      experience.addons.map((addon) => ({
        id: addon.id,
        label: addon.label,
        price: addon.feeBrl,
        selected: selection.selectedAddonIds.includes(addon.id),
      })),
    [experience.addons, selection.selectedAddonIds],
  );

  const relatedProducts = products
    .filter((item) => item.slug !== product.slug && (item.category === product.category || item.featured))
    .slice(0, 4);

  return (
    <div className="space-y-3 pb-[11.5rem] sm:space-y-4 sm:pb-32 xl:space-y-6 xl:pb-0">
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] xl:items-start xl:gap-6">
        <div className="order-1 space-y-3 sm:space-y-4 xl:order-2 xl:sticky xl:top-[5.25rem] xl:z-10 xl:self-start xl:space-y-5">
          <ProductPurchasePanel
            product={product}
            experience={experience}
            selection={selection}
            onModelChange={(modelId: string) => {
              const model = experience.models.find((item) => item.id === modelId) ?? experience.models[0];
              const format = experience.formats.find((item) => item.id === model?.formatId) ?? experience.formats[0];
              const modelIndex = Math.max(experience.models.findIndex((item) => item.id === modelId), 0);
              const nextGallery = experience.gallery[modelIndex % experience.gallery.length];

              setSelection((current) => ({
                ...current,
                modelId,
                formatId: format.id,
                width: format.width,
                height: format.height,
                material: model?.material ?? current.material,
                finishing: model?.finishing ?? current.finishing,
                colorId: model?.colorId ?? current.colorId,
                enhancementId: model?.enhancementId ?? current.enhancementId,
              }));

              if (nextGallery) {
                setActiveGalleryId(nextGallery.id);
              }
            }}
            onFormatChange={(formatId) => {
              const format = experience.formats.find((item) => item.id === formatId) ?? experience.formats[0];
              setSelection((current) => ({
                ...current,
                formatId,
                width: format.width,
                height: format.height,
              }));
            }}
            onMaterialChange={(material) => {
              setSelection((current) => ({ ...current, material }));
            }}
            onColorChange={(colorId) => {
              setSelection((current) => ({ ...current, colorId }));
            }}
            onEnhancementChange={(enhancementId) => {
              setSelection((current) => ({ ...current, enhancementId }));
            }}
            onFinishingChange={(finishing) => {
              setSelection((current) => ({ ...current, finishing }));
            }}
            onDeadlineChange={(deadline) => {
              setSelection((current) => ({ ...current, deadline }));
            }}
            onQuantityChange={(quantity) => {
              setSelection((current) => ({ ...current, quantity }));
            }}
          />

          <ProductAddonStrip
            addons={experience.addons}
            selectedAddonIds={selection.selectedAddonIds}
            onToggle={(addonId) => {
              setSelection((current) => ({
                ...current,
                selectedAddonIds: toggleAddon(current, addonId),
              }));
            }}
          />

          <ProductSummaryPanel
            product={product}
            experience={experience}
            selection={selection}
            quote={quote}
            selectedAddonsState={selectedAddons}
            editingCartItemId={editingCartItemId ?? null}
            cartNotes={cartNotes}
          />
        </div>

        <div className="order-2 space-y-2.5 sm:space-y-3 xl:order-1 xl:space-y-4">
          <div className="flex flex-col gap-0">
            <ProductGallery
              product={product}
              items={experience.gallery}
              activeId={activeGalleryId}
              onSelect={setActiveGalleryId}
              specsAttached
            />
            <ProductSpecs specs={experience.specs} attachBelowGallery />
          </div>
          <div id="arquivos">
            <TemplateDownloads downloads={experience.downloads} />
          </div>
          <ProductHeroPanel product={product} experience={experience} />
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="panel p-4 sm:p-5 lg:p-6">
          <div className="max-w-3xl border-b border-white/8 pb-3 sm:pb-4">
            <p className="label-kicker text-[0.64rem]">Relacionados</p>
            <h2 className="display-title mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
              Outros produtos da mesma linha
            </h2>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-white/60 sm:text-sm">
              Atalhos compactos para continuar comprando.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
