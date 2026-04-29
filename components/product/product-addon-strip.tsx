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
    <section
      className="rounded-[22px] border border-white/8 bg-white/[0.04] p-2.5 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-[28px] sm:p-3 xl:rounded-[34px]"
      aria-label="Servicos opcionais"
    >
      <p className="label-kicker text-[0.58rem] tracking-[0.2em]">Servicos opcionais</p>
      <p className="mt-0.5 text-[0.72rem] leading-snug text-white/58">Marque abaixo — soma no total.</p>

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
                  ? "scale-[1.01] border-cyan/45 bg-cyan/[0.14] shadow-[0_10px_24px_rgba(0,181,255,0.2)]"
                  : "border-white/12 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.07]",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition sm:h-5 sm:w-5",
                  selected ? "border-ink bg-ink text-white" : "border-white/20 bg-white/[0.08] text-transparent",
                )}
                aria-hidden="true"
              >
                <CheckIcon className="h-3 w-3" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="min-w-0 flex-1 text-[clamp(0.72rem,3.4vw,0.875rem)] font-semibold leading-tight text-white sm:flex-none">
                    {addon.label}
                  </span>
                  {priceHint ? (
                    <span className="shrink-0 text-[clamp(0.62rem,2.9vw,0.72rem)] font-semibold tabular-nums tracking-tight text-cyan-300">
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
