"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/common/product-card";
import { ProductRasterPicture } from "@/components/common/product-raster-picture";
import { calculateQuote } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import {
  getAddonsFeeTotalBrl,
  getDefaultSelection,
  type ProductExperience,
  type ProductSelectionState,
} from "@/lib/product-experience";
import type { Product } from "@/types";

import { ProductAddonStrip } from "./product-addon-strip";
import { ProductPurchasePanel } from "./product-purchase-panel";
import {
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
  relatedProducts = [],
}: {
  product: Product;
  experience: ProductExperience;
  initialSelection?: ProductSelectionState;
  editingCartItemId?: string | null;
  cartNotes?: string;
  relatedProducts?: Array<{ product: Product; imageSrc?: string | null }>;
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

  const activeGallery = experience.gallery.find((item) => item.id === activeGalleryId) ?? experience.gallery[0];
  const activeIndex = Math.max(experience.gallery.findIndex((item) => item.id === activeGallery?.id), 0);

  function goPrevImage() {
    if (!experience.gallery.length) return;
    const next = (activeIndex - 1 + experience.gallery.length) % experience.gallery.length;
    setActiveGalleryId(experience.gallery[next]!.id);
  }

  function goNextImage() {
    if (!experience.gallery.length) return;
    const next = (activeIndex + 1) % experience.gallery.length;
    setActiveGalleryId(experience.gallery[next]!.id);
  }

  return (
    <div className="space-y-4 pb-[11.5rem] sm:space-y-5 sm:pb-32 xl:space-y-6 xl:pb-0">
      <div className="flex flex-wrap items-center gap-2 px-1 text-[0.78rem] text-white/60">
        <Link href="/" className="transition hover:text-white">Home</Link>
        <span>{">"}</span>
        <Link href="/produtos" className="transition hover:text-white">Produtos</Link>
        <span>{">"}</span>
        <span className="text-white/70">{product.category}</span>
        <span>{">"}</span>
        <span className="text-cyan-300">{product.name}</span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[90px_minmax(0,1fr)_420px] xl:items-start xl:gap-4">
        <div className="order-2 grid grid-cols-5 gap-2 xl:order-1 xl:grid-cols-1 xl:grid-rows-[auto_minmax(0,1fr)_auto]">
          <button
            type="button"
            onClick={goPrevImage}
            className="focus-ring hidden h-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/70 backdrop-blur-xl transition hover:text-white xl:inline-flex"
            aria-label="Imagem anterior"
          >
            ^
          </button>
          <div className="col-span-5 grid grid-cols-5 gap-2 xl:col-span-1 xl:grid-cols-1">
            {experience.gallery.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.title}
                aria-pressed={item.id === activeGallery?.id}
                onClick={() => setActiveGalleryId(item.id)}
                className={cn(
                  "focus-ring group relative overflow-hidden rounded-[14px] border bg-white/[0.04] shadow-[0_8px_18px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-200",
                  item.id === activeGallery?.id
                    ? "border-cyan-400/70 ring-1 ring-cyan-400/35 shadow-[0_0_26px_rgba(56,189,248,0.22)]"
                    : "border-white/8 hover:border-white/18",
                )}
              >
                <div className="relative aspect-square bg-[radial-gradient(circle_at_top,rgba(11,15,26,0.9),rgba(5,7,13,0.95))]">
                  <ProductRasterPicture
                    src={item.src}
                    srcCandidates={item.srcCandidates}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1280px) 20vw, 90px"
                    className="object-contain p-1.5 transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={goNextImage}
            className="focus-ring hidden h-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/70 backdrop-blur-xl transition hover:text-white xl:inline-flex"
            aria-label="Próxima imagem"
          >
            v
          </button>
        </div>

        <div className="order-1 space-y-3 xl:order-2">
          <section className="rounded-[22px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[28px] sm:p-4 xl:rounded-[34px]">
            <div className="relative overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.04] backdrop-blur-xl">
              <div className="relative aspect-[4/4.35] min-h-[340px] bg-[radial-gradient(circle_at_top,rgba(11,15,26,0.95),rgba(5,7,13,0.98))] sm:min-h-[480px]">
                {activeGallery ? (
                  <ProductRasterPicture
                    src={activeGallery.src}
                    srcCandidates={activeGallery.srcCandidates}
                    alt={activeGallery.title}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1280px) 100vw, 760px"
                    className="object-contain p-3 sm:p-4"
                  />
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-center text-[0.72rem] text-white/60">Passe o mouse para ampliar</p>
          </section>

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
        </div>

        <div className="order-3 xl:sticky xl:top-[120px] xl:self-start">
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
      </div>

      <section className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl sm:grid-cols-3">
        {[
          { title: "Alta qualidade", text: "Impressao com cores vivas" },
          { title: "Durabilidade", text: "Material resistente e acabamento premium" },
          { title: "Satisfacao garantida", text: "Compromisso com o melhor resultado" },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-white/70">{item.text}</p>
          </div>
        ))}
      </section>

      <div className="space-y-3 sm:space-y-4">
        <ProductSpecs specs={experience.specs} />
        <div id="arquivos">
          <TemplateDownloads downloads={experience.downloads} />
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[28px] sm:p-5 lg:p-6 xl:rounded-[34px]">
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
              <ProductCard key={item.product.slug} product={item.product} compact imageSrc={item.imageSrc ?? undefined} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
