"use client";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience } from "@/lib/product-experience";

const TRUST_CARDS = [
  {
    title: "Impressão premium",
    text: "Cores vivas e definição impecável para sua marca se destacar.",
  },
  {
    title: "Material resistente",
    text: "Lonas e mídias de alta gramatura com durabilidade para uso real.",
  },
  {
    title: "Acabamento profissional",
    text: "Acabamentos que valorizam apresentação e percepção de valor.",
  },
  {
    title: "Entrega para todo o Brasil",
    text: "Agilidade e segurança na expedição com acompanhamento comercial.",
  },
] as const;

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  return (
    <div className="inline-flex items-center gap-0.5 text-amber-300" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "" : "text-white/25"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ProductTrustColumn({
  product,
  experience,
  className,
}: {
  product: Product;
  experience: ProductExperience;
  className?: string;
}) {
  const chips = [...(product.applications ?? []).slice(0, 6), product.category].filter(Boolean);
  const { value: ratingValue, reviews, caption } = experience.rating;

  return (
    <aside
      className={cn(
        "min-w-0 space-y-4 rounded-[22px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[0_20px_56px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5",
        className,
      )}
    >
      <div>
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Confiança</p>
        <h2 className="font-display mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">Por que escolher a Prismarq?</h2>
      </div>

      <ul className="space-y-2.5">
        {TRUST_CARDS.map((card) => (
          <li
            key={card.title}
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <p className="text-sm font-semibold text-white">{card.title}</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/65">{card.text}</p>
          </li>
        ))}
      </ul>

      <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/50">Ideal para</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <Badge key={chip} tone="neutral" className="max-w-full truncate border-white/12 bg-white/[0.06] text-[0.68rem] text-white/85">
              {chip}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <Stars value={ratingValue} />
          <span className="text-sm font-semibold tabular-nums text-white">{ratingValue.toFixed(1)}</span>
        </div>
        <p className="mt-1.5 text-[0.8125rem] text-white/70">
          Baseado em {reviews} avaliações{caption ? `. ${caption}` : ""}.
        </p>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-white/55">
          Equipe comercial acompanha medida, material e arte para reduzir retrabalho.
        </p>
      </div>
    </aside>
  );
}
