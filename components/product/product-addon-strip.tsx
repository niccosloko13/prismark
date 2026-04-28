"use client";

import { cn } from "@/lib/utils";
import type { ProductAddonService } from "@/lib/product-experience";

/** Curto e legível: "a partir de R$ X" → "+ R$ X" (reutilizado no resumo) */
export function formatAddonPriceHint(priceLabel: string) {
  const t = priceLabel.trim();
  if (!t) return "";
  return t.replace(/^a partir de\s+/i, "+ ");
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden="true">
      <path d="M5 13 10 18 19 7" strokeLinecap="round" strokeLinejoin="round" />
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
    <section className="panel p-2.5 sm:p-3" aria-label="Servicos opcionais">
      <p className="label-kicker text-[0.58rem] tracking-[0.2em]">Servicos opcionais</p>
      <p className="mt-0.5 text-[0.72rem] leading-snug text-black/52">Marque abaixo — soma no total.</p>

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {addons.map((addon) => {
          const selected = selectedAddonIds.includes(addon.id);
          const priceHint = formatAddonPriceHint(addon.priceLabel);

          return (
            <button
              key={addon.id}
              type="button"
              aria-pressed={selected}
              aria-label={`${addon.label}${priceHint ? `, ${priceHint}` : ""}`}
              title={addon.description}
              onClick={() => onToggle(addon.id)}
              className={cn(
                "focus-ring flex min-h-[2.85rem] items-center gap-2.5 rounded-[14px] border px-3 py-2 text-left transition duration-200 sm:min-h-[2.65rem] sm:rounded-[16px]",
                selected
                  ? "border-cyan/32 bg-[linear-gradient(180deg,rgba(0,181,255,0.09),rgba(255,255,255,0.98))] shadow-[0_8px_20px_rgba(0,181,255,0.08)]"
                  : "border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,249,250,0.94))] hover:border-black/16",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition sm:h-5 sm:w-5",
                  selected ? "border-ink bg-ink text-white" : "border-black/18 bg-white text-transparent",
                )}
                aria-hidden="true"
              >
                <CheckIcon className="h-3 w-3" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="min-w-0 flex-1 text-[clamp(0.72rem,3.4vw,0.875rem)] font-semibold leading-tight text-ink sm:flex-none">
                    {addon.label}
                  </span>
                  {priceHint ? (
                    <span className="shrink-0 text-[clamp(0.62rem,2.9vw,0.72rem)] font-semibold tabular-nums tracking-tight text-cyan-800">
                      {priceHint}
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
