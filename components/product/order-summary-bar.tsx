"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { COPY, pixOffNoPixLabel } from "@/lib/copy";
import { applyPixDiscount } from "@/lib/pix-discount";
import { buildCartItem } from "@/lib/cart";
import { formatSizeSummaryForSelection } from "@/lib/custom-product-size";
import { buildOrderUrl } from "@/lib/product-experience";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { PriceBreakdown, Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M6 9V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" strokeLinecap="round" />
      <path d="M6 9h15l-1.2 10.8A2 2 0 0 1 17.8 22H8.2a2 2 0 0 1-1.98-2.2L5 9Z" strokeLinejoin="round" />
    </svg>
  );
}

export function OrderSummaryBar({
  product,
  experience,
  selection,
  quote,
  editingCartItemId,
  cartNotes,
  flowComplete,
}: {
  product: Product;
  experience: ProductExperience;
  selection: ProductSelectionState;
  quote: PriceBreakdown;
  editingCartItemId?: string | null;
  cartNotes?: string;
  flowComplete: boolean;
}) {
  const router = useRouter();
  const { upsertItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const pixTotal = applyPixDiscount(quote.total);
  const pixDiscountAmount = quote.total - pixTotal;
  const unitAverage = quote.total / Math.max(selection.quantity, 1);
  const previewImage = experience.gallery[0]?.src ?? "";

  const enhancement = experience.enhancements.find((e) => e.id === selection.enhancementId);

  const chips: { label: string; value: string }[] = [
    { label: "Tamanho", value: formatSizeSummaryForSelection(selection) },
    { label: "Material", value: selection.material },
    { label: "Acabamento", value: selection.finishing },
    { label: "Produção", value: selection.deadline },
  ];
  if (enhancement) {
    chips.push({ label: "Extra", value: enhancement.label });
  }
  if (selection.selectedAddonIds.length > 0) {
    const labels = selection.selectedAddonIds
      .map((id) => experience.addons.find((a) => a.id === id)?.label)
      .filter(Boolean) as string[];
    if (labels.length) chips.push({ label: "Serviços", value: labels.join(", ") });
  }

  function handleCart() {
    if (!flowComplete) return;
    startTransition(() => {
      const item = buildCartItem({
        product,
        experience,
        selection,
        image: experience.gallery[0]?.src ?? "",
        notes: cartNotes,
      });
      upsertItem(item, editingCartItemId ?? undefined);
      if (editingCartItemId) router.push("/cart");
    });
  }

  function handleFinalize() {
    if (!flowComplete) return;
    router.push(buildOrderUrl(product, experience, selection));
  }

  const primaryDisabled = !flowComplete || isPending;
  const primaryLabel = !flowComplete ? COPY.completeOptions : COPY.buyNow;
  const secondaryLabel = isPending ? "Adicionando..." : editingCartItemId ? COPY.saveToCart : COPY.addToCart;

  return (
    <div
      id="order-summary-bar"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[50] w-full max-w-[100vw] border-t border-white/10 bg-[#05070d]/78 shadow-[0_-20px_50px_rgba(0,0,0,0.52)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#05070d]/64",
        "px-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-3 sm:px-4",
        "lg:static lg:inset-auto lg:z-auto lg:max-w-none lg:rounded-[22px] lg:border lg:border-white/10 lg:bg-[#05070d]/95 lg:px-5 lg:py-4 lg:shadow-[0_-12px_48px_rgba(0,0,0,0.45)] lg:backdrop-blur-xl",
      )}
    >
      {/* Mobile: barra compacta premium */}
      <div className="mx-auto w-full max-w-[1600px] lg:hidden">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-semibold leading-tight text-white">{product.name}</p>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0 text-[0.68rem] text-white/58">
              <span className="max-w-[100%] truncate">{selection.deadline}</span>
              <span className="text-white/30">·</span>
              <span className="shrink-0">{selection.quantity} un.</span>
              <span className="text-white/30">·</span>
              <span className="shrink-0 font-medium text-fuchsia-200/90">{pixOffNoPixLabel()}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/45">Total</p>
            <strong className="mt-0.5 block text-base font-semibold tabular-nums text-white">{formatCurrencyBRL(quote.total)}</strong>
          </div>
        </div>
        <p className="mt-2 text-center text-[0.78rem] font-semibold tabular-nums text-cyan-200/95">
          {formatCurrencyBRL(pixTotal)} no Pix
        </p>
        <div className="mt-3 grid w-full min-w-0 gap-2.5">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={primaryDisabled}
            className="home-btn-gradient focus-ring flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] px-4 text-[0.9375rem] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            {primaryLabel}
            <ArrowRight />
          </button>
          <button
            type="button"
            onClick={handleCart}
            disabled={primaryDisabled}
            className={cn(
              "focus-ring flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border border-white/14 bg-[#0a0e18]/95 px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {secondaryLabel}
            <CartIcon />
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-[1600px] flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/50">Resumo do seu pedido</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.slice(0, 6).map((c) => (
              <span
                key={`${c.label}-${c.value}`}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[0.68rem] text-white/80"
              >
                <span className="shrink-0 text-white/45">{c.label}:</span>
                <span className="min-w-0 truncate font-medium">{c.value}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 lg:shrink-0 lg:flex-nowrap">
          {previewImage ? (
            <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block">
              <Image src={previewImage} alt="" fill className="object-cover" sizes="56px" />
            </div>
          ) : null}
          <div className="min-w-0 text-right">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">Total estimado</p>
            <p className="text-lg font-bold tabular-nums text-white sm:text-xl">{formatCurrencyBRL(quote.total)}</p>
            <div className="mt-1.5 flex flex-col items-end gap-1 sm:items-end">
              <p className="text-[0.7rem] font-semibold text-amber-200/95">Melhor preço no PIX</p>
              <span className="inline-flex max-w-full rounded-full bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-cyan-500/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)]">
                {pixOffNoPixLabel()}
              </span>
              <p className="text-[0.72rem] font-semibold tabular-nums text-white/90">ou {formatCurrencyBRL(pixTotal)} no PIX</p>
            </div>
            <p className="mt-1 text-[0.68rem] text-white/50">
              em até 3x de {formatCurrencyBRL(unitAverage)} sem juros · −{formatCurrencyBRL(pixDiscountAmount)} no PIX
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[280px]">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={primaryDisabled}
            className="home-btn-gradient focus-ring flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            {primaryLabel}
            <ArrowRight />
          </button>
          <button
            type="button"
            onClick={handleCart}
            disabled={primaryDisabled}
            className={cn(
              "focus-ring flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {secondaryLabel}
            <CartIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
