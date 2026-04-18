"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/common/badge";
import { BrandLogo } from "@/components/layout/brand-logo";
import { companyProfile } from "@/lib/company";
import type { ProductDownloadAsset, ProductGalleryItem } from "@/lib/product-experience";
import type { Product } from "@/types";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 4v10" strokeLinecap="round" />
      <path d="m8 10 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18h14" strokeLinecap="round" />
    </svg>
  );
}

function AssetGlyph({ kind }: { kind: ProductDownloadAsset["icon"] }) {
  const label = kind === "illustrator" ? "Ai" : kind === "corel" ? "Cdr" : "PDF";
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-black text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,15,15,0.12)]">
      {label}
    </span>
  );
}

export function ProductGallery({
  product,
  items,
  activeId,
  onSelect,
}: {
  product: Product;
  items: ProductGalleryItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const activeIndex = Math.max(items.findIndex((item) => item.id === active.id), 0);

  return (
    <section className="panel overflow-hidden p-4 sm:p-5 lg:p-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_108px] lg:gap-4">
        <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(253,253,253,1),rgba(246,247,249,0.95))] shadow-[0_28px_64px_rgba(15,15,15,0.08)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,181,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,211,0,0.12),transparent_30%)]" />
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone={active.accent}>{product.badge}</Badge>
              <span className="rounded-full border border-black/10 bg-white/92 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/56">
                {product.category}
              </span>
            </div>
            <span className="rounded-full border border-black/8 bg-white/86 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/54 shadow-[0_10px_20px_rgba(15,15,15,0.04)]">
              {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>

          <div className="relative aspect-[5/4] min-h-[300px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(244,246,248,0.95))] sm:min-h-[440px]">
            <Image
              src={active.src}
              alt={active.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-contain p-5 transition duration-500 sm:p-7 lg:p-8"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <div className="rounded-[24px] border border-white/50 bg-white/74 p-4 text-ink shadow-[0_24px_48px_rgba(15,15,15,0.08)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                {(active.tags ?? []).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 bg-white/88 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-black/58"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-black/42">{active.subtitle}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/66 sm:text-[0.94rem]">
                {active.caption ?? "Visual de apresentacao para negociacao, aprovacao e fechamento com mais seguranca."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 lg:grid-cols-1 lg:gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.title}
              aria-pressed={item.id === active.id}
              onClick={() => onSelect(item.id)}
              className={
                item.id === active.id
                  ? "focus-ring group relative overflow-hidden rounded-[22px] border border-cyan/42 bg-[linear-gradient(180deg,rgba(0,181,255,0.06),rgba(255,255,255,1))] ring-1 ring-cyan/16 shadow-[0_20px_36px_rgba(0,181,255,0.14)] transition duration-300"
                  : "focus-ring group relative overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_14px_28px_rgba(15,15,15,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-black/16 hover:shadow-[0_18px_34px_rgba(15,15,15,0.08)]"
              }
            >
              <div className="relative aspect-square bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(244,246,248,0.94))]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 22vw, 108px"
                  className="object-contain p-2 transition duration-300 group-hover:scale-[1.03] sm:p-2.5"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.995),rgba(246,247,249,0.95))] p-4 shadow-[0_20px_42px_rgba(15,15,15,0.05)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-[22px] border border-black/10 bg-white px-3 py-2 shadow-[0_10px_22px_rgba(15,15,15,0.04)]">
              <BrandLogo size="md" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/42">Assinatura Prismarq</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-ink">Prismarq Comunicacao Visual</p>
              <p className="mt-1 text-sm leading-6 text-black/56">{companyProfile.shortTrustLine}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-black/58">
              Qualidade Prismarq
            </span>
            <span className="rounded-full border border-cyan/24 bg-cyan/[0.08] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink">
              Producao profissional
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductSpecs({
  specs,
}: {
  specs: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="panel p-6 sm:p-8">
      <div className="max-w-3xl border-b border-black/8 pb-6">
        <p className="label-kicker">Especificacoes</p>
        <h2 className="display-title mt-3 text-[clamp(1.9rem,2.5vw,2.8rem)] font-semibold tracking-tight text-ink">
          Informacoes tecnicas organizadas para uma leitura mais clara.
        </h2>
        <p className="mt-3 text-sm leading-6 text-black/58">
          Tudo o que impacta producao, acabamento e aprovacao da peca fica reunido em uma tabela limpa.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white">
        {specs.map((item, index) => (
          <div
            key={item.label}
            className={index === specs.length - 1 ? "grid gap-2 px-5 py-4 sm:grid-cols-[190px_minmax(0,1fr)]" : "grid gap-2 border-b border-black/8 px-5 py-4 sm:grid-cols-[190px_minmax(0,1fr)]"}
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-black/42">{item.label}</p>
            <p className="text-sm leading-6 text-black/72">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TemplateDownloads({
  downloads,
}: {
  downloads: ProductDownloadAsset[];
}) {
  return (
    <section className="panel p-6 sm:p-8">
      <div className="max-w-3xl border-b border-black/8 pb-6">
        <p className="label-kicker">Arquivos e gabaritos</p>
        <h2 className="display-title mt-3 text-[clamp(1.9rem,2.5vw,2.8rem)] font-semibold tracking-tight text-ink">
          Baixe os gabaritos certos antes de enviar a arte.
        </h2>
        <p className="mt-3 text-sm leading-6 text-black/58">
          Estrutura organizada para Illustrator, Corel e PDF, com leitura mais limpa e acao direta.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {downloads.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            download={item.downloadName}
            className="surface-card group p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,15,15,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <AssetGlyph kind={item.icon} />
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink transition group-hover:bg-black/[0.05]">
                <DownloadIcon />
              </span>
            </div>
            <strong className="mt-4 block text-base font-semibold tracking-[-0.02em] text-ink">{item.label}</strong>
            <p className="mt-2 text-sm leading-6 text-black/60">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
