"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/common/badge";
import { BrandLogo } from "@/components/layout/brand-logo";
import { companyProfile } from "@/lib/company";
import type { ProductDownloadAsset, ProductGalleryItem } from "@/lib/product-experience";
import { cn } from "@/lib/utils";
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

export function ProductGallery({
  product,
  items,
  activeId,
  onSelect,
  specsAttached = false,
}: {
  product: Product;
  items: ProductGalleryItem[];
  activeId: string;
  onSelect: (id: string) => void;
  specsAttached?: boolean;
}) {
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const activeIndex = Math.max(items.findIndex((item) => item.id === active.id), 0);

  return (
    <section
      className={cn(
        "panel overflow-hidden p-3 sm:p-4 lg:p-5",
        specsAttached && "rounded-b-none",
      )}
    >
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_92px] lg:gap-3">
        <div className="relative overflow-hidden rounded-[22px] border border-black/10 bg-[linear-gradient(180deg,rgba(253,253,253,1),rgba(246,247,249,0.95))] shadow-[0_16px_40px_rgba(15,15,15,0.06)] sm:rounded-[26px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,181,255,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,211,0,0.08),transparent_34%)]" />
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <Badge tone={active.accent} className="text-[0.65rem]">
                {product.badge}
              </Badge>
              <span className="truncate rounded-full border border-black/10 bg-white/92 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black/56 sm:px-3 sm:py-1 sm:text-[0.65rem]">
                {product.category}
              </span>
            </div>
            <span className="shrink-0 rounded-full border border-black/8 bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/54 sm:px-2.5 sm:text-[0.68rem]">
              {String(activeIndex + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
            </span>
          </div>

          <div className="relative aspect-[4/3] min-h-[200px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(244,246,248,0.95))] sm:aspect-[5/4] sm:min-h-[280px] lg:min-h-[320px]">
            <Image
              src={active.src}
              alt={active.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-contain p-3 transition duration-500 sm:p-5 lg:p-6"
            />
          </div>

          <div className="border-t border-black/8 bg-white/80 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
            <div className="flex flex-wrap gap-1.5">
              {(active.tags ?? []).slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black/58 sm:px-2.5 sm:text-[0.64rem]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-black/42">{active.subtitle}</p>
            <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-black/66 sm:line-clamp-none sm:text-sm sm:leading-6">
              {active.caption ?? "Visual de apresentacao para negociacao, aprovacao e fechamento com mais seguranca."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-1 lg:gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.title}
              aria-pressed={item.id === active.id}
              onClick={() => onSelect(item.id)}
              className={
                item.id === active.id
                  ? "focus-ring group relative overflow-hidden rounded-[14px] border border-cyan/40 bg-[linear-gradient(180deg,rgba(0,181,255,0.06),rgba(255,255,255,1))] ring-1 ring-cyan/14 shadow-[0_10px_24px_rgba(0,181,255,0.12)] transition duration-200 sm:rounded-[18px] lg:rounded-[20px]"
                  : "focus-ring group relative overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.04)] transition duration-200 hover:border-black/16 hover:shadow-[0_12px_24px_rgba(15,15,15,0.06)] sm:rounded-[18px] lg:rounded-[20px]"
              }
            >
              <div className="relative aspect-square bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(244,246,248,0.94))]">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 20vw, 92px"
                  className="object-contain p-1.5 transition duration-300 group-hover:scale-[1.03] sm:p-2"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-3 rounded-[18px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.995),rgba(246,247,249,0.95))] p-3 shadow-[0_12px_28px_rgba(15,15,15,0.04)] sm:mt-4 sm:rounded-[22px] sm:p-3.5",
          specsAttached &&
            "mt-2.5 rounded-b-none border-b-0 shadow-none sm:mt-3 sm:rounded-b-none",
        )}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-[14px] border border-black/10 bg-white px-2 py-1.5 shadow-[0_8px_18px_rgba(15,15,15,0.04)] sm:rounded-[18px] sm:px-2.5 sm:py-2">
              <BrandLogo size="sm" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/42">Prismarq</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-ink sm:text-base">Comunicacao visual</p>
              <p className="mt-0.5 line-clamp-2 text-[0.75rem] leading-snug text-black/56 sm:text-sm sm:leading-5">
                {companyProfile.shortTrustLine}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-black/58">
              Qualidade
            </span>
            <span className="rounded-full border border-cyan/24 bg-cyan/[0.08] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink">
              Producao propria
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductSpecs({
  specs,
  attachBelowGallery = false,
}: {
  specs: Array<{ label: string; value: string }>;
  attachBelowGallery?: boolean;
}) {
  return (
    <section
      className={cn(
        "panel p-4 sm:p-5 lg:p-6",
        attachBelowGallery &&
          "-mt-px rounded-t-none border-t-0 pt-3 shadow-[0_14px_34px_rgba(15,15,15,0.045)] sm:pt-4 lg:pt-5",
      )}
    >
      <div className="max-w-3xl border-b border-black/8 pb-3 sm:pb-4">
        <p className="label-kicker text-[0.64rem]">Especificacoes</p>
        <h2 className="display-title mt-1.5 text-lg font-semibold tracking-tight text-ink sm:mt-2 sm:text-xl">
          Ficha tecnica resumida
        </h2>
        <p className="mt-1.5 text-[0.8125rem] leading-snug text-black/58 sm:text-sm sm:leading-6">
          Producao, acabamento e aprovacao em um unico bloco.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-[16px] border border-black/10 bg-white sm:rounded-[20px]">
        <dl className="divide-y divide-black/[0.06]">
          {specs.map((item) => (
            <div key={item.label} className="grid gap-0.5 px-3 py-2.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-4 sm:px-4 sm:py-3">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-black/45 sm:pt-0.5">{item.label}</dt>
              <dd className="text-[0.8125rem] font-medium leading-snug text-black/75 sm:text-sm sm:leading-6">{item.value}</dd>
            </div>
          ))}
        </dl>
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
    <section className="panel p-4 sm:p-5 lg:p-6">
      <div className="max-w-3xl border-b border-black/8 pb-3 sm:pb-4">
        <p className="label-kicker text-[0.64rem]">Arquivos e gabaritos</p>
        <h2 className="display-title mt-1.5 text-lg font-semibold tracking-tight text-ink sm:mt-2 sm:text-xl">
          Downloads para montar a arte
        </h2>
        <p className="mt-1.5 text-[0.8125rem] leading-snug text-black/58 sm:text-sm sm:leading-6">
          Illustrator, Corel e PDF em cards compactos.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
        {downloads.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            download={item.downloadName}
            className="surface-card group flex gap-3 p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,15,15,0.07)] sm:flex-col sm:p-3.5"
          >
            <div className="flex shrink-0 items-start justify-between gap-2 sm:w-full">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] bg-black text-xs font-semibold text-white shadow-[0_8px_16px_rgba(15,15,15,0.12)] sm:h-10 sm:w-10 sm:rounded-[16px] sm:text-sm">
                {item.icon === "illustrator" ? "Ai" : item.icon === "corel" ? "Cdr" : "PDF"}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink transition group-hover:bg-black/[0.05] sm:hidden">
                <DownloadIcon />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm font-semibold text-ink sm:text-[0.95rem]">{item.label}</strong>
              <p className="mt-1 line-clamp-2 text-[0.75rem] leading-snug text-black/58 sm:line-clamp-none sm:text-[0.8125rem] sm:leading-5">
                {item.description}
              </p>
            </div>
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink transition group-hover:bg-black/[0.05] sm:inline-flex">
              <DownloadIcon />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
