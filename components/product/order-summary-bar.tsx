"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { COPY, pixEconomizePagarNoPixLabel, pixOffNoPixLabel } from "@/lib/copy";
import { applyPixDiscount } from "@/lib/pix-discount";
import { buildCartItem } from "@/lib/cart";
import { formatSizeSummaryForSelection } from "@/lib/custom-product-size";
import { buildOrderUrl } from "@/lib/product-experience";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { PriceBreakdown, Product } from "@/types";
import type { ProductExperience, ProductSelectionState } from "@/lib/product-experience";

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
  const primaryLabel = !flowComplete ? COPY.completeOptions : COPY.finalizeOrder;

  return (
    <div
      id="order-summary-bar"
      className={cn(
        "z-[40] border border-white/10 bg-[#05070d]/95 shadow-[0_-12px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        "fixed inset-x-0 bottom-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-3 sm:px-4 lg:static lg:inset-auto lg:rounded-[22px] lg:border lg:px-5 lg:py-4",
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
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
              <p className="text-[0.7rem] font-semibold text-amber-200/95">💸 Melhor preço no PIX</p>
              <span className="inline-flex max-w-full rounded-full bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-cyan-500/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)]">
                {pixOffNoPixLabel()}
              </span>
              <p className="max-w-[18rem] text-[0.72rem] font-medium leading-snug text-emerald-200/95 sm:max-w-[22rem]">
                {pixEconomizePagarNoPixLabel()}
              </p>
              <p className="text-[0.72rem] font-semibold tabular-nums text-white/90">
                ou {formatCurrencyBRL(pixTotal)} no PIX
              </p>
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
            className={cn(
              "home-btn-gradient focus-ring flex min-h-[52px] flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={handleCart}
            disabled={primaryDisabled}
            className={cn(
              "focus-ring flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {isPending ? "Adicionando..." : editingCartItemId ? COPY.saveToCart : COPY.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
