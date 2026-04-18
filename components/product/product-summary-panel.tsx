"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/common/badge";
import { buildCartItem } from "@/lib/cart";
import { buildOrderUrl } from "@/lib/product-experience";
import type { ShippingQuoteResult } from "@/lib/shipping";
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 3.5 3.5" strokeLinecap="round" />
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

function InlineShippingCalculator({
  product,
  selection,
  onQuoteChange,
}: {
  product: Product;
  selection: ProductSelectionState;
  onQuoteChange: (quote: ShippingQuoteResult | null) => void;
}) {
  const [cep, setCep] = useState("");
  const [status, setStatus] = useState("Digite seu CEP para consultar retirada ou entrega.");
  const [isPending, startTransition] = useTransition();

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    const digits = cep.replace(/\D/g, "");
    if (digits.length < 8) {
      setStatus("Informe um CEP valido para estimar entrega ou retirada.");
      onQuoteChange(null);
      return;
    }

    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          cep: digits,
          product: product.slug,
          width: String(selection.width),
          height: String(selection.height),
          quantity: String(selection.quantity),
        });

        const response = await fetch(`/api/shipping/quote?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Nao foi possivel calcular o frete.");
        }

        onQuoteChange(payload);
        setStatus(payload.note ?? "Cotacao atualizada com sucesso.");
      } catch (error) {
        onQuoteChange(null);
        setStatus(error instanceof Error ? error.message : "Nao foi possivel calcular o frete.");
      }
    });
  }

  return (
    <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.98),rgba(245,246,248,0.92))] p-4 shadow-[0_18px_36px_rgba(15,15,15,0.04),inset_0_1px_0_rgba(255,255,255,0.82)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Frete e retirada</p>
          <p className="mt-1 text-sm leading-6 text-black/56">Consulte o CEP antes de concluir a compra.</p>
        </div>
        <Badge tone="cyan">CEP</Badge>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="block flex-1">
          <span className="sr-only">CEP</span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="00000-000"
              value={cep}
              onChange={(event) => setCep(formatCep(event.target.value))}
              className="field h-[3.25rem] rounded-[18px] pr-12 shadow-[0_14px_28px_rgba(15,15,15,0.04)]"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/36">
              <SearchIcon />
            </span>
          </div>
        </label>
        <button type="submit" disabled={isPending} className="btn btn-secondary focus-ring min-h-[3.25rem] sm:px-5">
          {isPending ? "Calculando..." : "Calcular"}
        </button>
      </form>

      <p className="mt-3 text-sm leading-6 text-black/56">{status}</p>
    </div>
  );
}

export function ProductSummaryPanel({
  product,
  experience,
  selection,
  quote,
  editingCartItemId,
  cartNotes,
}: {
  product: Product;
  experience: ProductExperience;
  selection: ProductSelectionState;
  quote: PriceBreakdown;
  editingCartItemId?: string | null;
  cartNotes?: string;
}) {
  const router = useRouter();
  const { upsertItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const [pricePulse, setPricePulse] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteResult | null>(null);

  const selectedAddons = experience.addons.filter((item) => selection.selectedAddonIds.includes(item.id));
  const color = experience.colors.find((item) => item.id === selection.colorId) ?? experience.colors[0];
  const pixTotal = quote.total * 0.85;
  const unitAverage = quote.total / Math.max(selection.quantity, 1);
  const shippingRecommended = shippingQuote?.methods.find((item) => item.recommended) ?? shippingQuote?.methods[0];
  const naturalSummary = `${selection.quantity} un. em ${selection.material.toLowerCase()}, ${selection.width} x ${selection.height} cm, ${selection.finishing.toLowerCase()} e ${color?.label ?? "cor padrao"}.`;

  useEffect(() => {
    setPricePulse(true);
    const timeout = window.setTimeout(() => setPricePulse(false), 240);
    return () => window.clearTimeout(timeout);
  }, [quote.total]);

  useEffect(() => {
    setShippingQuote(null);
  }, [product.slug, selection.width, selection.height, selection.quantity, selection.material, selection.finishing, selection.deadline]);

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
      <section className="panel p-5 sm:p-6">
        <div className="rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(246,247,249,0.94))] p-5 shadow-[0_26px_56px_rgba(15,15,15,0.08),inset_0_1px_0_rgba(255,255,255,0.86)]">
          <div className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="cyan">Fechamento</Badge>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/54">
                  15% OFF no Pix
                </span>
              </div>
              <p className="label-kicker mt-3">Resumo do pedido</p>
              <h2 className="display-title mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-ink">
                Preco final pronto para adicionar ao carrinho
              </h2>
              <p className="mt-2 text-sm leading-6 text-black/56">
                Fechamento comercial com prazo, Pix e resumo da configuracao no mesmo bloco.
              </p>
            </div>
            <Badge tone="yellow">{selection.deadline}</Badge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)]">
            <div className="rounded-[26px] border border-black/10 bg-[linear-gradient(180deg,rgba(251,251,252,1),rgba(246,247,248,0.92))] p-5 shadow-[0_18px_38px_rgba(15,15,15,0.04)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/42">Valor final</p>
              <strong
                className={cn(
                  "mt-3 block text-[clamp(2.45rem,4vw,3.4rem)] font-semibold tracking-[-0.05em] text-ink transition duration-300 motion-safe:transform-gpu",
                  pricePulse ? "scale-[1.02]" : "scale-100",
                )}
              >
                {formatCurrencyBRL(quote.total)}
              </strong>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,15,15,0.16)]">
                  {formatCurrencyBRL(pixTotal)} no Pix
                </span>
                <span className="text-sm font-medium text-black/54">media de {formatCurrencyBRL(unitAverage)}/unidade</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-black/56">
                Preco atualizado conforme formato, material, acabamento, quantidade e prazo selecionados.
              </p>
            </div>

            <div className="rounded-[26px] border border-black/10 bg-[linear-gradient(180deg,rgba(0,181,255,0.08),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_36px_rgba(0,181,255,0.08)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/42">Acao principal</p>
              <p className="mt-2 text-sm leading-6 text-black/56">
                Escolha entre salvar no carrinho ou seguir direto para o checkout com a configuracao atual.
              </p>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={handleCartAction}
                  disabled={isPending}
                  className="focus-ring inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-base font-semibold text-white shadow-[0_26px_48px_rgba(15,15,15,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-black disabled:cursor-wait disabled:opacity-80"
                >
                  {isPending ? "Adicionando..." : editingCartItemId ? "Salvar alteracoes no carrinho" : "Adicionar ao carrinho"}
                  <ArrowRight />
                </button>
                {!editingCartItemId ? (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="btn btn-secondary focus-ring min-h-[3.5rem] w-full justify-center"
                  >
                    Comprar agora
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-xs leading-5 text-black/48">Compra segura com suporte comercial, checagem e producao propria Prismarq.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="surface-muted p-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Quantidade</p>
              <strong className="mt-2 block text-lg font-semibold text-ink">{selection.quantity} un.</strong>
            </div>
            <div className="surface-muted p-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Area real</p>
              <strong className="mt-2 block text-lg font-semibold text-ink">{quote.area.toFixed(2)} m2</strong>
            </div>
            <div className="surface-muted p-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Area faturavel</p>
              <strong className="mt-2 block text-lg font-semibold text-ink">{quote.billableArea.toFixed(2)} m2</strong>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.98),rgba(246,247,248,0.9))] p-4 shadow-[0_16px_32px_rgba(15,15,15,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Resumo da escolha</p>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/54">
                {selection.deadline}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/68">{naturalSummary}</p>
            {selectedAddons.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedAddons.map((addon) => (
                  <span
                    key={addon.id}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-black/62"
                  >
                    {addon.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="surface-card p-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Subtotal</p>
              <strong className="mt-2 block text-base font-semibold text-ink">{formatCurrencyBRL(quote.subtotal)}</strong>
            </div>
            <div className="surface-card p-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Acabamento</p>
              <strong className="mt-2 block text-base font-semibold text-ink">{formatCurrencyBRL(quote.finishingFee)}</strong>
            </div>
            <div className="surface-card p-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Base por m2</p>
              <strong className="mt-2 block text-base font-semibold text-ink">{formatCurrencyBRL(quote.pricePerM2)}</strong>
            </div>
          </div>

          <div className="mt-4">
            <InlineShippingCalculator product={product} selection={selection} onQuoteChange={setShippingQuote} />
          </div>

          <div className="mt-4 rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_16px_34px_rgba(15,15,15,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Entrega e retirada</p>
              {shippingRecommended ? <Badge tone="yellow">{shippingRecommended.etaLabel}</Badge> : <Badge tone="neutral">Sem cotacao</Badge>}
            </div>

            {shippingRecommended ? (
              <div className="mt-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm font-semibold text-ink">{shippingRecommended.label}</strong>
                    <p className="mt-1 text-sm text-black/58">
                      {shippingQuote?.destination.city} • {shippingQuote?.destination.state}
                    </p>
                  </div>
                  <strong className="text-base font-semibold text-ink">
                    {shippingRecommended.price === 0 ? "Gratis" : formatCurrencyBRL(shippingRecommended.price)}
                  </strong>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/58">{shippingRecommended.description}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-black/58">Calcule o CEP para comparar retirada, entrega local e transportadora.</p>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: <SparkIcon />, label: "Producao propria" },
              { icon: <TruckIcon />, label: "Envio ou retirada" },
              { icon: <ShieldIcon />, label: "Revisao de arquivo" },
              { icon: <HeadsetIcon />, label: "Suporte comercial" },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(246,247,248,0.94))] p-3.5 shadow-[0_12px_26px_rgba(15,15,15,0.03)]">
                <div className="flex items-center gap-2 text-ink">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-black/[0.04]">{item.icon}</span>
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black/62">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.85rem)] z-40 sm:inset-x-4 lg:hidden">
        <div className="rounded-[24px] border border-black/10 bg-white/96 p-3 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] shadow-[0_24px_48px_rgba(15,15,15,0.16)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.72rem] text-black/54">
                <span>{selection.deadline}</span>
                <span className="h-1 w-1 rounded-full bg-black/18" />
                <span>{selection.quantity} un.</span>
                <span className="h-1 w-1 rounded-full bg-black/18" />
                <span>15% OFF no Pix</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">Total</p>
              <strong
                className={cn(
                  "mt-1 block text-lg font-semibold text-ink transition duration-300 motion-safe:transform-gpu",
                  pricePulse ? "scale-[1.03]" : "scale-100",
                )}
              >
                {formatCurrencyBRL(quote.total)}
              </strong>
            </div>
          </div>
          <div className="mt-2 rounded-full bg-black/[0.03] px-3 py-2 text-center text-sm font-medium text-ink">
            {formatCurrencyBRL(pixTotal)} no Pix
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleCartAction}
              disabled={isPending}
              className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-[0_24px_44px_rgba(15,15,15,0.18)] transition duration-200 hover:bg-black disabled:cursor-wait disabled:opacity-80"
            >
              {isPending ? "Adicionando..." : editingCartItemId ? "Salvar no carrinho" : "Adicionar ao carrinho"}
              <ArrowRight />
            </button>
            {!editingCartItemId ? (
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-secondary focus-ring min-h-12 w-full justify-center"
              >
                Comprar agora
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
