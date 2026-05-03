"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/common/badge";
import { formatAddonPriceHint } from "@/components/product/product-addon-strip";
import { buildCartItem } from "@/lib/cart";
import { pixEconomizePagarNoPixLabel, pixOffNoPixLabel } from "@/lib/copy";
import { applyPixDiscount } from "@/lib/pix-discount";
import { isCustomFormatId } from "@/lib/custom-product-size";
import { buildOrderUrl } from "@/lib/product-experience";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { PriceBreakdown, Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M3 6h11v9H3z" strokeLinejoin="round" />
      <path d="M14 9h3l4 3v3h-7V9Z" strokeLinejoin="round" />
      <circle cx="8" cy="18" r="1.75" />
      <circle cx="18" cy="18" r="1.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 3 5 6v5c0 4.6 2.7 8 7 10 4.3-2 7-5.4 7-10V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9.5 11.5 1.8 1.8 3.5-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 12a8 8 0 1 1 16 0" strokeLinecap="round" />
      <path d="M4 12v4a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 0-2 2Z" strokeLinejoin="round" />
      <path d="M20 12v4a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 2Z" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4Z" strokeLinejoin="round" />
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

export function ProductSummaryPanel({
  product,
  experience,
  selection,
  quote,
  selectedAddonsState,
  editingCartItemId,
  cartNotes,
}: {
  product: Product;
  experience: ProductExperience;
  selection: ProductSelectionState;
  quote: PriceBreakdown;
  selectedAddonsState: Array<{ id: string; label: string; price: number; selected: boolean }>;
  editingCartItemId?: string | null;
  cartNotes?: string;
}) {
  const router = useRouter();
  const { upsertItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const [pricePulse, setPricePulse] = useState(false);

  const selectedAddons = experience.addons.filter((item) => selection.selectedAddonIds.includes(item.id));
  const selectedAddonsForSummary = selectedAddonsState.filter((item) => item.selected);
  const color = experience.colors.find((item) => item.id === selection.colorId) ?? experience.colors[0];
  const pixTotal = applyPixDiscount(quote.total);
  const pixDiscount = quote.total - pixTotal;
  const unitAverage = quote.total / Math.max(selection.quantity, 1);
  const sizePhrase = isCustomFormatId(selection.formatId)
    ? `tamanho personalizado (${selection.width} x ${selection.height} cm)`
    : `${selection.width} x ${selection.height} cm`;
  const naturalSummary = `${selection.quantity} un. em ${selection.material.toLowerCase()}, ${sizePhrase}, ${selection.finishing.toLowerCase()} e ${color?.label ?? "cor padrão"}.`;
  const previewImage = experience.gallery[0]?.src ?? "";

  useEffect(() => {
    setPricePulse(true);
    const timeout = window.setTimeout(() => setPricePulse(false), 240);
    return () => window.clearTimeout(timeout);
  }, [quote.total]);

  function handleCartAction() {
    startTransition(() => {
      const item = buildCartItem({
        product,
        experience,
        selection,
        image: experience.gallery[0]?.src ?? "",
        notes: cartNotes,
      });

      upsertItem(item, editingCartItemId ?? undefined);

      if (editingCartItemId) {
        router.push("/cart");
      }
    });
  }

  function handleBuyNow() {
    router.push(buildOrderUrl(product, experience, selection));
  }

  return (
    <>
      <section
        className={cn(
          "rounded-[20px] border border-white/12 bg-white/[0.07] p-3 shadow-[0_0_0_1px_rgba(168,85,247,0.12),0_8px_40px_rgba(168,85,247,0.14),0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[24px] sm:p-3.5 xl:p-4",
          "ring-1 ring-white/[0.09]",
        )}
        id="resumo-pedido"
      >
        <div className="rounded-[16px] border border-white/10 bg-[#070a12]/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[18px] sm:p-3.5">
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
            <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Resumo do pedido</h2>
            <Badge tone="magenta" className="px-1.5 py-0.5 text-[0.56rem]">1 item</Badge>
          </div>

          <div className="mt-2 flex gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2 backdrop-blur-xl">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#05070d] sm:h-16 sm:w-16">
              {previewImage?.trim() ? (
                <Image src={previewImage} alt={product.name} fill className="object-cover" sizes="64px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 text-xs text-white/72 sm:text-[0.8125rem]">
              <p className="truncate font-semibold text-white">{product.name}</p>
              <p className="truncate">{selection.material}</p>
              <p className="truncate">{selection.colorId} · {selection.finishing}</p>
              <p className="truncate">{selection.deadline}</p>
              <p className="truncate">{selection.quantity} unidade</p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-white sm:text-sm">{formatCurrencyBRL(quote.total)}</p>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/65">Subtotal</span>
              <strong className="font-semibold tabular-nums text-white">{formatCurrencyBRL(quote.subtotal)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/65">Frete</span>
              <strong className="font-semibold text-emerald-300">Grátis</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/65">Desconto</span>
              <strong className="font-semibold tabular-nums text-pink-300">- {formatCurrencyBRL(pixDiscount)}</strong>
            </div>
          </div>

          <div
            className={cn(
              "mt-3 rounded-xl border border-white/12 bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent p-3 shadow-[0_0_32px_rgba(236,72,153,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]",
              pricePulse && "motion-safe:shadow-[0_0_40px_rgba(56,189,248,0.18)]",
            )}
          >
            <div className="flex items-end justify-between gap-2">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-xs">Total</span>
              <div className="text-right">
                <strong
                  className={cn(
                    "block text-[1.65rem] font-bold tracking-tight text-white tabular-nums transition duration-300 motion-safe:transform-gpu sm:text-[2.2rem]",
                    "drop-shadow-[0_0_28px_rgba(56,189,248,0.35),0_2px_12px_rgba(0,0,0,0.45)]",
                    pricePulse ? "scale-[1.03]" : "scale-100",
                  )}
                >
                  {formatCurrencyBRL(pixTotal)}
                </strong>
                <span className="mt-0.5 block text-[0.65rem] text-white/55 sm:text-xs">
                  em até 3x de {formatCurrencyBRL(unitAverage)} sem juros
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-lg border border-emerald-400/30 bg-emerald-500/[0.12] p-2 sm:p-2.5">
            <p className="text-[0.68rem] font-semibold text-emerald-200 sm:text-xs">{pixOffNoPixLabel()}</p>
            <p className="text-[0.78rem] text-white/75 sm:text-sm">{pixEconomizePagarNoPixLabel()}</p>
            <p className="mt-0.5 text-[0.78rem] font-semibold tabular-nums text-white/90 sm:text-sm">
              ou {formatCurrencyBRL(pixTotal)} no PIX
            </p>
          </div>

          <div className="mt-2.5 hidden gap-1.5 lg:grid">
            {!editingCartItemId ? (
              <button type="button" onClick={handleBuyNow} className="btn btn-primary focus-ring min-h-11 w-full justify-center text-sm">
                Finalizar pedido
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleCartAction}
              disabled={isPending}
              className={cn(
                "focus-ring min-h-10 w-full justify-center text-sm",
                editingCartItemId ? "btn btn-primary" : "btn btn-secondary",
              )}
            >
              {isPending ? "Adicionando..." : editingCartItemId ? "Salvar no carrinho" : "Adicionar ao carrinho"}
            </button>
            <p className="pt-0.5 text-center text-[0.65rem] text-white/55">Ambiente seguro e criptografado</p>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[50] w-full max-w-[100vw] border-t border-white/10 bg-[#05070d]/78 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 shadow-[0_-20px_50px_rgba(0,0,0,0.52)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#05070d]/64 sm:px-4 lg:hidden">
        <div className="mx-auto w-full min-w-0 max-w-[1600px]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-semibold leading-tight text-white">{product.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[0.68rem] text-white/58">
                <span className="max-w-full truncate">{selection.deadline}</span>
                <span className="text-white/30">·</span>
                <span>{selection.quantity} un.</span>
                <span className="text-white/30">·</span>
                <span className="font-medium text-fuchsia-200/90">{pixOffNoPixLabel()}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/45">Total</p>
              <strong
                className={cn(
                  "mt-0.5 block text-base font-semibold tabular-nums text-white transition duration-300 motion-safe:transform-gpu",
                  pricePulse ? "scale-[1.03]" : "scale-100",
                )}
              >
                {formatCurrencyBRL(quote.total)}
              </strong>
            </div>
          </div>
          <p className="mt-2 text-center text-[0.78rem] font-semibold tabular-nums text-cyan-200/95">
            {formatCurrencyBRL(pixTotal)} no Pix
          </p>
          <div className="mt-3 grid w-full min-w-0 gap-2.5">
            {!editingCartItemId ? (
              <button
                type="button"
                onClick={handleBuyNow}
                className="home-btn-gradient focus-ring flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] px-4 text-[0.9375rem] font-semibold motion-reduce:transform-none"
              >
                Comprar agora
                <ArrowRight />
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleCartAction}
              disabled={isPending}
              className={cn(
                "focus-ring flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] px-4 text-sm font-semibold disabled:cursor-wait disabled:opacity-75",
                editingCartItemId
                  ? "btn btn-primary"
                  : "border border-white/14 bg-[#0a0e18]/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.07]",
              )}
            >
              {isPending ? "Adicionando..." : editingCartItemId ? "Salvar no carrinho" : "Adicionar ao carrinho"}
              <CartIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
