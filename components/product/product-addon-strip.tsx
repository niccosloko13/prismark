"use client";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";
import type { ProductAddonService } from "@/lib/product-experience";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4Z" strokeLinejoin="round" />
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

export function ProductAddonStrip({
  addons,
  selectedAddonIds,
  onToggle,
}: {
  addons: ProductAddonService[];
  selectedAddonIds: string[];
  onToggle: (addonId: string) => void;
}) {
  if (addons.length === 0) {
    return null;
  }

  return (
    <section className="panel p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-kicker">Servicos opcionais</p>
          <h2 className="display-title mt-2 text-[1.32rem] font-semibold tracking-[-0.03em] text-ink">
            Inclua apoio criativo e tecnico sem sair do fluxo de compra.
          </h2>
          <p className="mt-2 text-sm leading-6 text-black/56">
            Extras com valor percebido real para melhorar arte, conferencia e acabamento final.
          </p>
        </div>
        <Badge tone="cyan">Opcionais</Badge>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {addons.map((addon) => {
          const selected = selectedAddonIds.includes(addon.id);

          return (
            <button
              key={addon.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(addon.id)}
              className={cn(
                "focus-ring flex h-full flex-col rounded-[26px] border p-4 text-left transition duration-200",
                selected
                  ? "border-cyan/26 bg-[linear-gradient(180deg,rgba(0,181,255,0.1),rgba(255,255,255,0.98))] text-ink shadow-[0_24px_44px_rgba(0,181,255,0.12)]"
                  : "border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.995),rgba(247,248,249,0.94))] shadow-[0_18px_36px_rgba(15,15,15,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-0.5 hover:border-black/18 hover:shadow-[0_22px_44px_rgba(15,15,15,0.08)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-[18px]",
                    selected
                      ? "bg-white text-ink shadow-[0_10px_22px_rgba(15,15,15,0.06)]"
                      : addon.highlighted
                        ? "bg-yellow/18 text-ink"
                        : "bg-black/[0.04] text-ink",
                  )}
                >
                  {addon.highlighted ? <SparkIcon /> : <ShieldIcon />}
                </span>

                <div className="flex flex-wrap justify-end gap-2">
                  {addon.highlighted ? <Badge tone="yellow">Recomendado</Badge> : null}
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
                      selected ? "bg-ink text-white" : "border border-current/12 text-black/62",
                    )}
                  >
                    {addon.priceLabel}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <strong className="block text-[1.05rem] font-semibold tracking-[-0.02em]">{addon.label}</strong>
                <p className="mt-2 text-sm leading-6 text-black/66">{addon.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/50">
                    {selected ? "Servico incluido" : "Adicionar ao pedido"}
                  </p>
                  <p className="mt-1 text-sm text-black/60">
                    {selected ? "Voce pode remover quando quiser." : "Inclua com um toque."}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition",
                    selected
                      ? "bg-ink text-white shadow-[0_12px_24px_rgba(15,15,15,0.12)]"
                      : "border border-black/10 bg-white text-ink shadow-[0_12px_24px_rgba(15,15,15,0.04)]",
                  )}
                >
                  {selected ? "Incluido" : "Incluir"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
