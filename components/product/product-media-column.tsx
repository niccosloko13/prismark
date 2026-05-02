"use client";

import Link from "next/link";

import { Badge } from "@/components/common/badge";
import { ProductRasterPicture } from "@/components/common/product-raster-picture";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductExperience, ProductGalleryItem } from "@/lib/product-experience";

const MINI_BENEFITS = [
  { title: "Alta qualidade", text: "Cores vivas e definição impecável." },
  { title: "Durabilidade", text: "Materiais pensados para uso real." },
  { title: "Entrega rápida", text: "Prazos claros e logística organizada." },
] as const;

export function ProductMediaColumn({
  product,
  gallery,
  activeGalleryId,
  onSelectGallery,
  className,
}: {
  product: Product;
  gallery: ProductGalleryItem[];
  activeGalleryId: string;
  onSelectGallery: (id: string) => void;
  className?: string;
}) {
  const active = gallery.find((item) => item.id === activeGalleryId) ?? gallery[0];
  const activeIndex = Math.max(gallery.findIndex((item) => item.id === active?.id), 0);
  const hasGallery = gallery.length > 0;
  const showInUseLink = gallery.length >= 2;

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-2.5 shadow-[0_20px_56px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-3">
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#070a12]/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:rounded-[20px]">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
            {product.featured ? (
              <Badge tone="yellow" className="text-[0.62rem] shadow-[0_8px_24px_rgba(250,204,21,0.25)]">
                Mais vendido
              </Badge>
            ) : null}
            <Badge tone="cyan" className="text-[0.62rem]">
              {product.badge}
            </Badge>
          </div>

          <div className="relative aspect-[4/4.1] min-h-[220px] bg-[radial-gradient(circle_at_30%_18%,rgba(56,189,248,0.08),transparent_42%),radial-gradient(circle_at_top,rgba(11,15,26,0.96),rgba(5,7,13,0.99))] sm:min-h-[320px] md:min-h-[380px]">
            {active && hasGallery ? (
              <ProductRasterPicture
                src={active.src}
                srcCandidates={active.srcCandidates}
                alt={active.title}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 560px"
                className="object-contain p-4 sm:p-6 md:p-8"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-white/70">
                  Imagem em preparação
                </span>
                <p className="max-w-sm text-sm text-white/55">Em breve você verá fotos reais deste produto no catálogo.</p>
              </div>
            )}
          </div>
        </div>

        {hasGallery && gallery.length > 1 ? (
          <div className="mt-2.5 grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
            {gallery.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.title}
                aria-pressed={item.id === active?.id}
                onClick={() => onSelectGallery(item.id)}
                className={cn(
                  "focus-ring relative aspect-square overflow-hidden rounded-xl border bg-white/[0.04] transition sm:rounded-[14px]",
                  item.id === active?.id
                    ? "border-fuchsia-400/70 ring-2 ring-cyan-400/35 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    : "border-white/10 hover:border-white/20",
                )}
              >
                <ProductRasterPicture
                  src={item.src}
                  srcCandidates={item.srcCandidates}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 22vw, 96px"
                  className="object-contain p-1 sm:p-1.5"
                />
              </button>
            ))}
          </div>
        ) : null}

        {showInUseLink ? (
          <div className="mt-2.5 flex justify-center">
            <Link
              href="#veja-em-uso"
              className="focus-ring text-[0.78rem] font-semibold text-cyan-300/90 underline-offset-4 transition hover:text-cyan-200 hover:underline"
            >
              Ver aplicação real
            </Link>
          </div>
        ) : null}
      </div>

      <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3.5 backdrop-blur-xl sm:px-5 sm:py-4">
        <h2 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">{product.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/68">{product.lead || product.description}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {MINI_BENEFITS.map((b) => (
            <li
              key={b.title}
              className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[0.8125rem] leading-snug"
            >
              <span className="font-semibold text-white">{b.title}</span>
              <span className="mt-0.5 block text-white/60">{b.text}</span>
            </li>
          ))}
        </ul>
        {hasGallery ? (
          <p className="mt-3 text-center text-[0.68rem] text-white/45">
            Foto {activeIndex + 1} de {gallery.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}
