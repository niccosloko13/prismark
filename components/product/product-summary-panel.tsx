"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/common/badge";
import { formatAddonPriceHint } from "@/components/product/product-addon-strip";
import { buildCartItem } from "@/lib/cart";
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
  const pixTotal = quote.total * 0.85;
  const unitAverage = quote.total / Math.max(selection.quantity, 1);
  const naturalSummary = `${selection.quantity} un. em ${selection.material.toLowerCase()}, ${selection.width} x ${selection.height} cm, ${selection.finishing.toLowerCase()} e ${color?.label ?? "cor padrao"}.`;

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
      <section className="panel p-3.5 sm:p-5" id="resumo-pedido">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4 shadow-[0_20px_44px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:rounded-[26px] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/8 pb-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="cyan" className="px-2.5 py-1 text-[0.6rem]">
                  Total
                </Badge>
                <span className="rounded-full border border-white/12 bg-white/[0.08] px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/65">
                  15% Pix
                </span>
              </div>
              <h2 className="display-title mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">Fechar pedido</h2>
              <p className="mt-1 text-[0.78rem] leading-snug text-white/60 sm:text-[0.8125rem]">
                Confira o valor e siga para o carrinho ou checkout.
              </p>
            </div>
            <Badge tone="yellow" className="shrink-0 px-2.5 py-1 text-[0.6rem]">
              {selection.deadline}
            </Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:rounded-[22px] sm:p-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/45">Valor</p>
              <strong
                className={cn(
                  "mt-2 block text-[clamp(2rem,3.6vw,2.85rem)] font-semibold tracking-[-0.04em] text-white transition duration-300 motion-safe:transform-gpu",
                  pricePulse ? "scale-[1.02]" : "scale-100",
                )}
              >
                {formatCurrencyBRL(quote.total)}
              </strong>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.8125rem]">
                <span className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(236,72,153,0.35)] sm:text-sm">
                  {formatCurrencyBRL(pixTotal)} Pix
                </span>
                <span className="font-medium text-white/55">{formatCurrencyBRL(unitAverage)}/un.</span>
              </div>
            </div>

            <div className="hidden w-full gap-2 lg:grid">
              <button
                type="button"
                onClick={handleCartAction}
                disabled={isPending}
                className="btn btn-primary focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 text-sm font-semibold transition duration-200 disabled:cursor-wait disabled:opacity-80 sm:min-h-[3.15rem] sm:text-[0.95rem]"
              >
                {isPending ? "Adicionando..." : editingCartItemId ? "Salvar no carrinho" : "Adicionar ao carrinho"}
                <ArrowRight />
              </button>
              {!editingCartItemId ? (
                <button type="button" onClick={handleBuyNow} className="btn btn-secondary focus-ring min-h-11 w-full justify-center text-sm sm:min-h-12">
                  Comprar agora
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="surface-muted px-2 py-2 sm:px-3 sm:py-2.5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45 sm:text-[0.62rem]">Qtd</p>
              <strong className="mt-0.5 block text-sm font-semibold text-white sm:text-base">{selection.quantity} un.</strong>
            </div>
            <div className="surface-muted px-2 py-2 sm:px-3 sm:py-2.5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45 sm:text-[0.62rem]">Area</p>
              <strong className="mt-0.5 block text-sm font-semibold text-white sm:text-base">{quote.area.toFixed(2)} m2</strong>
            </div>
            <div className="surface-muted px-2 py-2 sm:px-3 sm:py-2.5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45 sm:text-[0.62rem]">Fatur.</p>
              <strong className="mt-0.5 block text-sm font-semibold text-white sm:text-base">{quote.billableArea.toFixed(2)} m2</strong>
            </div>
          </div>

          <div className="mt-3 rounded-[18px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_12px_26px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/45">Sua escolha</p>
              <span className="rounded-full border border-white/12 bg-white/[0.08] px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/65">
                {selection.deadline}
              </span>
            </div>
            <p className="mt-2 text-[0.8125rem] leading-snug text-white/70 sm:text-sm sm:leading-6">{naturalSummary}</p>
            {selectedAddons.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedAddons.map((addon) => {
                  const hint = formatAddonPriceHint(addon.priceLabel);
                  return (
                    <span
                      key={addon.id}
                      className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-cyan/28 bg-white/[0.08] px-2 py-1 sm:px-2.5 sm:py-1"
                    >
                      <span className="min-w-0 truncate text-[clamp(0.58rem,3.2vw,0.68rem)] font-semibold uppercase leading-tight tracking-[0.06em] text-white/75 sm:tracking-[0.08em]">
                        {addon.label}
                      </span>
                      {hint ? (
                        <span className="shrink-0 text-[clamp(0.55rem,2.8vw,0.65rem)] font-semibold tabular-nums text-cyan-300">
                          {hint}
                        </span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 rounded-[16px] border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[0.78rem] shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:gap-x-5 sm:text-[0.8125rem]">
            <div>
              <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45">Subtotal</span>
              <strong className="font-semibold text-white">{formatCurrencyBRL(quote.subtotal)}</strong>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />
            <div>
              <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45">Acab.</span>
              <strong className="font-semibold text-white">{formatCurrencyBRL(quote.finishingFee)}</strong>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />
            <div>
              <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45">R$/m2</span>
              <strong className="font-semibold text-white">{formatCurrencyBRL(quote.pricePerM2)}</strong>
            </div>
            {quote.addonsTotal > 0 ? (
              <>
                <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />
                <div>
                  <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/45">Extras</span>
                  <strong className="font-semibold text-cyan-300">{formatCurrencyBRL(quote.addonsTotal)}</strong>
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-3 rounded-[16px] border border-cyan/25 bg-cyan/[0.1] px-3 py-2.5">
            <p className="text-[0.7rem] font-semibold text-cyan-200">Serviços adicionais incluídos no total</p>
            {selectedAddonsForSummary.length > 0 ? (
              <ul className="mt-1.5 space-y-1 text-[0.75rem] font-medium text-white/72 sm:text-[0.8rem]">
                {selectedAddonsForSummary.map((addon) => (
                  <li key={addon.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{addon.label}</span>
                    <span className="shrink-0 font-semibold text-cyan-300">+ {formatCurrencyBRL(addon.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[0.75rem] text-white/60 sm:text-[0.8rem]">Nenhum serviço adicional selecionado.</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: <SparkIcon />, label: "Producao propria" },
              { icon: <TruckIcon />, label: "Envio / retirada" },
              { icon: <ShieldIcon />, label: "Revisao de arquivo" },
              { icon: <HeadsetIcon />, label: "Suporte" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[14px] border border-white/8 bg-white/[0.04] px-2 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:rounded-[16px] sm:px-2.5"
              >
                <div className="flex items-center gap-1.5 text-white">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] [&_svg]:h-3.5 [&_svg]:w-3.5">
                    {item.icon}
                  </span>
                  <span className="text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.08em] text-white/65 sm:text-[0.62rem]">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-white/8 bg-[#05070d]/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2.5 shadow-[0_-16px_44px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-4 lg:hidden">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-semibold leading-tight text-white">{product.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[0.68rem] text-white/58">
                <span>{selection.deadline}</span>
                <span className="text-white/30">·</span>
                <span>{selection.quantity} un.</span>
                <span className="text-white/30">·</span>
                <span>Pix -15%</span>
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
          <p className="mt-1.5 text-center text-[0.78rem] font-semibold tabular-nums text-cyan-300">{formatCurrencyBRL(pixTotal)} no Pix</p>
          <div className="mt-2.5 grid w-full gap-2">
            {!editingCartItemId ? (
              <button
                type="button"
                onClick={handleBuyNow}
                className="home-btn-gradient focus-ring flex min-h-[52px] w-full items-center justify-center gap-2 px-4 text-[0.9375rem] font-semibold motion-reduce:transform-none"
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
                "focus-ring flex w-full items-center justify-center gap-2 px-4 text-sm font-semibold disabled:cursor-wait disabled:opacity-75",
                editingCartItemId
                  ? "btn btn-primary min-h-[52px]"
                  : "min-h-[48px] rounded-full border border-white/15 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_26px_rgba(0,0,0,0.25)] transition hover:bg-white/12",
              )}
            >
              {isPending ? "Adicionando..." : editingCartItemId ? "Salvar no carrinho" : "Adicionar ao carrinho"}
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
