"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/common/product-card";
import { products } from "@/lib/catalog";
import { calculateQuote } from "@/lib/pricing";
import { getDefaultSelection, type ProductExperience, type ProductSelectionState } from "@/lib/product-experience";
import type { Product } from "@/types";

import { ProductAddonStrip } from "./product-addon-strip";
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
  });

  const relatedProducts = products
    .filter((item) => item.slug !== product.slug && (item.category === product.category || item.featured))
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-[9.5rem] sm:space-y-7 sm:pb-32 xl:pb-0">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.98fr)] xl:items-start xl:gap-7">
        <div className="space-y-6">
          <ProductGallery
            product={product}
            items={experience.gallery}
            activeId={activeGalleryId}
            onSelect={setActiveGalleryId}
          />
        </div>

        <div className="space-y-6">
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
            editingCartItemId={editingCartItemId ?? null}
            cartNotes={cartNotes}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] xl:gap-7">
        <ProductSpecs specs={experience.specs} />
        <div id="arquivos">
          <TemplateDownloads downloads={experience.downloads} />
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="panel p-6 sm:p-8">
          <div className="max-w-4xl border-b border-black/8 pb-6">
            <p className="label-kicker">Relacionados</p>
            <h2 className="display-title mt-3 text-[clamp(1.9rem,2.4vw,2.6rem)] font-semibold tracking-tight text-ink">
              Continue comprando com solucoes proximas desta linha
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/58">
              Produtos da mesma frente comercial, com leitura rapida de imagem, preco inicial e acao direta.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
