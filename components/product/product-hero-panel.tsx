"use client";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";
import type { ProductExperience } from "@/lib/product-experience";
import type { Product } from "@/types";

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("h-3.5 w-3.5", active ? "text-yellow-500" : "text-black/16")}>
      <path
        d="m10 2.2 2.42 4.9 5.4.79-3.91 3.81.92 5.38L10 14.54l-4.83 2.54.92-5.38L2.18 7.89l5.4-.79L10 2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarGlyphs({ value }: { value: number }) {
  const rounded = Math.round(value);

  return (
    <div className="inline-flex items-center gap-1" aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} active={index < rounded} />
      ))}
    </div>
  );
}

function socialStats(rating?: ProductExperience["rating"]) {
  const reviews = rating?.reviews ?? 96;

  return {
    reviews,
    orders: Math.max(reviews * 12, 1080),
    onTimeRate: rating?.value && rating.value >= 4.9 ? "98%" : "97%",
  };
}

export function ProductHeroPanel({ product, experience }: { product: Product; experience: ProductExperience }) {
  const rating = experience.rating;
  const stats = socialStats(rating);

  return (
    <section className="panel relative overflow-hidden p-3 sm:p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,181,255,0),rgba(0,181,255,0.42),rgba(255,46,191,0.44),rgba(255,211,0,0.38),rgba(255,211,0,0))]" />

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Badge tone="cyan" className="text-[0.58rem]">
          {product.badge}
        </Badge>
        <span className="rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-black/56 sm:px-3 sm:py-1 sm:text-[0.65rem]">
          {product.category}
        </span>
        <span className="rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-black/56 sm:px-3 sm:py-1 sm:text-[0.65rem]">
          Producao propria
        </span>
        {rating ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/66 sm:gap-2 sm:px-3 sm:py-1 sm:text-[0.68rem]">
            <StarGlyphs value={rating.value} />
            {rating.value.toFixed(1)} • {rating.reviews} avaliacoes
          </span>
        ) : null}
      </div>

      <h1 className="display-title mt-2.5 max-w-3xl text-balance text-[clamp(1.35rem,3.2vw,2.25rem)] font-semibold leading-[1.05] tracking-tight text-ink sm:mt-3">
        {product.name}
      </h1>
      <p className="mt-1.5 max-w-3xl text-[0.875rem] font-medium leading-relaxed text-ink/90 sm:mt-2 sm:text-[0.95rem] sm:leading-6">
        {product.lead}
      </p>
      <p className="mt-1 line-clamp-3 max-w-3xl text-[0.78rem] leading-snug text-black/58 sm:mt-1.5 sm:line-clamp-none sm:text-[0.8125rem] sm:leading-6">
        {product.description}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="rounded-[14px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,248,0.92))] px-2 py-2 shadow-[0_8px_18px_rgba(15,15,15,0.03)] sm:rounded-[18px] sm:px-2.5 sm:py-2.5">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-black/42 sm:text-[0.6rem]">Nota</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-0.5 sm:mt-1 sm:gap-1">
            <StarGlyphs value={rating?.value ?? 4.8} />
            <strong className="text-xs font-semibold text-ink sm:text-sm">{(rating?.value ?? 4.8).toFixed(1)}</strong>
          </div>
          <p className="mt-0.5 text-[0.62rem] leading-snug text-black/54 sm:text-[0.68rem]">{stats.reviews} aval.</p>
        </div>
        <div className="rounded-[14px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,248,0.92))] px-2 py-2 shadow-[0_8px_18px_rgba(15,15,15,0.03)] sm:rounded-[18px] sm:px-2.5 sm:py-2.5">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-black/42 sm:text-[0.6rem]">Pedidos</p>
          <strong className="mt-0.5 block truncate text-base font-semibold tracking-tight text-ink sm:mt-1 sm:text-lg">
            +{new Intl.NumberFormat("pt-BR").format(stats.orders)}
          </strong>
          <p className="mt-0.5 text-[0.62rem] leading-snug text-black/54 sm:text-[0.68rem]">produzidos</p>
        </div>
        <div className="rounded-[14px] border border-cyan/18 bg-[linear-gradient(180deg,rgba(0,181,255,0.07),rgba(255,255,255,0.96))] px-2 py-2 shadow-[0_8px_18px_rgba(0,181,255,0.06)] sm:rounded-[18px] sm:px-2.5 sm:py-2.5">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-black/42 sm:text-[0.6rem]">Prazo</p>
          <strong className="mt-0.5 block text-base font-semibold tracking-tight text-ink sm:mt-1 sm:text-lg">{stats.onTimeRate}</strong>
          <p className="mt-0.5 text-[0.62rem] leading-snug text-black/54 sm:text-[0.68rem]">no prazo</p>
        </div>
      </div>
    </section>
  );
}
