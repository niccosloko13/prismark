"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/common/product-card";
import { OrderAuthPanel, type OrderAuthTab } from "@/components/order/order-auth-panel";
import {
  clampCustomDimensions,
  customSizePolicyFromMeta,
  PRISMARQ_CUSTOM_FORMAT_ID,
  type CustomSizePolicy,
} from "@/lib/custom-product-size";
import {
  buildOrderUrl,
  getAddonsFeeTotalBrl,
  getDefaultSelection,
  type ProductExperience,
  type ProductSelectionState,
} from "@/lib/product-experience";
import { calculateQuoteForProduct } from "@/lib/pricing";
import { PRISMARQ_PRODUCT_CTA_EVENT, type ProductCtaBroadcastDetail } from "@/lib/storefront-events";
import type { StoreProductMeta } from "@/lib/store-product-payload";
import { cn } from "@/lib/utils";
import type { Product, SessionUser } from "@/types";

import { OrderSummaryBar } from "./order-summary-bar";
import { ProductMediaColumn } from "./product-media-column";
import { ProductInUseGallery, ProductSpecs, TemplateDownloads } from "./product-sections";
import { ProductStepConfigurator } from "./product-step-configurator";
import { ProductTrustColumn } from "./product-trust-column";

function toggleAddon(selection: ProductSelectionState, addonId: string) {
  return selection.selectedAddonIds.includes(addonId)
    ? selection.selectedAddonIds.filter((item) => item !== addonId)
    : [...selection.selectedAddonIds, addonId];
}

export function ProductStudio({
  product,
  experience,
  customSizePolicy: customSizePolicyProp,
  initialSelection,
  editingCartItemId,
  cartNotes,
  relatedProducts = [],
  initialSession = null,
}: {
  product: Product;
  experience: ProductExperience;
  /** Se omitido, deriva de `storeMeta` no produto quando existir (ex.: `ActiveProduct`). */
  customSizePolicy?: CustomSizePolicy | null;
  initialSelection?: ProductSelectionState;
  editingCartItemId?: string | null;
  cartNotes?: string;
  relatedProducts?: Array<{ product: Product; imageSrc?: string | null }>;
  initialSession?: SessionUser | null;
}) {
  const router = useRouter();
  const customSizePolicy =
    customSizePolicyProp ??
    customSizePolicyFromMeta(
      "storeMeta" in product ? (product as Product & { storeMeta?: StoreProductMeta | null }).storeMeta ?? undefined : undefined,
    );
  const [activeGalleryId, setActiveGalleryId] = useState(experience.gallery[0]?.id ?? "");
  const [selection, setSelection] = useState<ProductSelectionState>(
    () => initialSelection ?? getDefaultSelection(product, experience),
  );
  const [checkoutUnlocked, setCheckoutUnlocked] = useState(() => Boolean(editingCartItemId));
  const [session, setSession] = useState<SessionUser | null>(initialSession ?? null);
  const [productAuthOpen, setProductAuthOpen] = useState(false);
  const [orderAuthTab, setOrderAuthTab] = useState<OrderAuthTab>("login");

  useEffect(() => {
    setSession(initialSession ?? null);
  }, [initialSession]);

  useEffect(() => {
    setActiveGalleryId(experience.gallery[0]?.id ?? "");
    setSelection(initialSelection ?? getDefaultSelection(product, experience));
    setCheckoutUnlocked(Boolean(editingCartItemId));
  }, [experience, product, initialSelection, editingCartItemId]);

  const quote = calculateQuoteForProduct(product, {
    width: selection.width,
    height: selection.height,
    quantity: selection.quantity,
    material: selection.material,
    finishing: selection.finishing,
    deadline: selection.deadline,
    addonsTotal: getAddonsFeeTotalBrl(experience, selection),
  });

  const onModelChange = useCallback(
    (modelId: string) => {
      const model = experience.models.find((item) => item.id === modelId) ?? experience.models[0];
      const format = experience.formats.find((item) => item.id === model?.formatId) ?? experience.formats[0];
      const modelIndex = Math.max(experience.models.findIndex((item) => item.id === modelId), 0);
      const nextGallery = experience.gallery[modelIndex % experience.gallery.length];

      setSelection((current) => {
        if (current.formatId === PRISMARQ_CUSTOM_FORMAT_ID && customSizePolicy) {
          const clamped = clampCustomDimensions(current.width, current.height, customSizePolicy);
          return {
            ...current,
            modelId,
            formatId: PRISMARQ_CUSTOM_FORMAT_ID,
            width: clamped.width,
            height: clamped.height,
            material: model?.material ?? current.material,
            finishing: model?.finishing ?? current.finishing,
            colorId: model?.colorId ?? current.colorId,
            enhancementId: model?.enhancementId ?? current.enhancementId,
          };
        }
        return {
          ...current,
          modelId,
          formatId: format.id,
          width: format.width,
          height: format.height,
          material: model?.material ?? current.material,
          finishing: model?.finishing ?? current.finishing,
          colorId: model?.colorId ?? current.colorId,
          enhancementId: model?.enhancementId ?? current.enhancementId,
        };
      });

      if (nextGallery) {
        setActiveGalleryId(nextGallery.id);
      }
    },
    [experience, customSizePolicy],
  );

  const onCheckoutUnlocked = useCallback((unlocked: boolean) => {
    setCheckoutUnlocked(unlocked);
  }, []);

  /** Contexto adicional: demais fotos do catálogo (evita duplicar a hero). */
  const inUseItems = useMemo(() => {
    if (experience.gallery.length < 2) return [];
    return experience.gallery.slice(1);
  }, [experience.gallery]);

  const orderReturnTo = useMemo(
    () => buildOrderUrl(product, experience, selection),
    [product, experience, selection],
  );

  useEffect(() => {
    const detail: ProductCtaBroadcastDetail = { mode: checkoutUnlocked ? "full" : "compact" };
    window.dispatchEvent(new CustomEvent(PRISMARQ_PRODUCT_CTA_EVENT, { detail }));
    return () => {
      window.dispatchEvent(new CustomEvent(PRISMARQ_PRODUCT_CTA_EVENT, { detail: { mode: null } }));
    };
  }, [checkoutUnlocked]);

  return (
    <div
      className={cn(
        "min-w-0 space-y-4 sm:space-y-5 lg:pb-6 xl:pb-8",
        checkoutUnlocked
          ? "max-lg:pb-[18.25rem] max-lg:sm:pb-[19rem]"
          : "max-lg:pb-[15.25rem] max-lg:sm:pb-[16rem]",
      )}
    >
      <nav
        className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 px-0.5 text-[0.78rem] text-white/60"
        aria-label="Trilha"
      >
        <Link href="/" className="transition hover:text-white">
          Home
        </Link>
        <span aria-hidden>{">"}</span>
        <Link href="/produtos" className="transition hover:text-white">
          Produtos
        </Link>
        <span aria-hidden>{">"}</span>
        <span className="min-w-0 truncate text-white/70">{product.category}</span>
        <span aria-hidden>{">"}</span>
        <span className="min-w-0 truncate text-cyan-300">{product.name}</span>
      </nav>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12 xl:gap-5">
        <ProductMediaColumn
          product={product}
          gallery={experience.gallery}
          activeGalleryId={activeGalleryId}
          onSelectGallery={setActiveGalleryId}
          className="md:col-span-1 xl:col-span-5"
        />

        <div className="min-w-0 md:col-span-1 xl:col-span-4">
          <ProductStepConfigurator
            product={product}
            experience={experience}
            selection={selection}
            customSizePolicy={customSizePolicy}
            onModelChange={onModelChange}
            onCustomDimensionsChange={
              customSizePolicy
                ? (widthCm, heightCm) => {
                    const clamped = clampCustomDimensions(widthCm, heightCm, customSizePolicy);
                    setSelection((current) => ({
                      ...current,
                      formatId: PRISMARQ_CUSTOM_FORMAT_ID,
                      width: clamped.width,
                      height: clamped.height,
                    }));
                  }
                : undefined
            }
            onFormatChange={(formatId) => {
              if (formatId === PRISMARQ_CUSTOM_FORMAT_ID && customSizePolicy) {
                setSelection((current) => {
                  const clamped = clampCustomDimensions(current.width, current.height, customSizePolicy);
                  return {
                    ...current,
                    formatId: PRISMARQ_CUSTOM_FORMAT_ID,
                    width: clamped.width,
                    height: clamped.height,
                  };
                });
                return;
              }
              const format = experience.formats.find((item) => item.id === formatId) ?? experience.formats[0];
              setSelection((current) => ({
                ...current,
                formatId,
                width: format.width,
                height: format.height,
              }));
            }}
            onMaterialChange={(material) => setSelection((c) => ({ ...c, material }))}
            onColorChange={(colorId) => setSelection((c) => ({ ...c, colorId }))}
            onEnhancementChange={(enhancementId) => setSelection((c) => ({ ...c, enhancementId }))}
            onFinishingChange={(finishing) => setSelection((c) => ({ ...c, finishing }))}
            onDeadlineChange={(deadline) => setSelection((c) => ({ ...c, deadline }))}
            onQuantityChange={(quantity) => setSelection((c) => ({ ...c, quantity }))}
            onToggleAddon={(addonId) =>
              setSelection((current) => ({ ...current, selectedAddonIds: toggleAddon(current, addonId) }))
            }
            onCheckoutUnlocked={onCheckoutUnlocked}
          />
        </div>

        <ProductTrustColumn product={product} experience={experience} className="md:col-span-2 xl:col-span-3" />
      </div>

      <OrderSummaryBar
        product={product}
        experience={experience}
        selection={selection}
        quote={quote}
        editingCartItemId={editingCartItemId ?? null}
        cartNotes={cartNotes}
        flowComplete={checkoutUnlocked}
        session={session}
        onRequestLogin={() => {
          setOrderAuthTab("login");
          setProductAuthOpen(true);
        }}
      />

      {productAuthOpen ? (
        <div
          className="fixed inset-0 z-[62] flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="presentation"
          onClick={() => setProductAuthOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setProductAuthOpen(false);
          }}
        >
          <div
            className="flex max-h-[min(92vh,760px)] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border border-white/12 bg-[#05070d] shadow-[0_-20px_60px_rgba(0,0,0,0.55)] sm:rounded-[24px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-auth-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p id="product-auth-modal-title" className="text-sm font-semibold text-white">
                Entrar na Prismarq
              </p>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setProductAuthOpen(false)}
                className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white transition hover:bg-white/[0.12]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1 sm:px-4">
              <OrderAuthPanel
                embedded
                activeTab={orderAuthTab}
                onActiveTabChange={setOrderAuthTab}
                returnToPath={orderReturnTo}
                onSuccess={() => {
                  setProductAuthOpen(false);
                  router.push(orderReturnTo);
                  router.refresh();
                }}
                onCollapse={() => setProductAuthOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0 space-y-4 sm:space-y-5">
        <ProductSpecs specs={experience.specs} />
        <div id="arquivos">
          <TemplateDownloads downloads={experience.downloads} />
        </div>
        <ProductInUseGallery items={inUseItems} productName={product.name} />
      </div>

      {relatedProducts.length > 0 ? (
        <section className="rounded-[20px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[24px] sm:p-4 lg:p-5">
          <div className="max-w-3xl border-b border-white/8 pb-2.5 sm:pb-3">
            <p className="label-kicker text-[0.64rem]">Relacionados</p>
            <h2 className="display-title mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
              Complete seu pedido
            </h2>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-white/60 sm:text-sm">
              Outros produtos da mesma linha para fechar comunicação visual com consistência.
            </p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.product.slug}
                product={item.product}
                compact
                imageSrc={item.imageSrc ?? undefined}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
