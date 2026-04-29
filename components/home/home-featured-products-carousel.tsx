"use client";

import Link from "next/link";
import { useRef } from "react";

import { ProductRasterPicture } from "@/components/common/product-raster-picture";
import { products } from "@/lib/catalog";
import { getProductPrimaryImagePath } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const HOME_FEATURED_SLUGS = ["banner", "backdrop", "backdrop-tecido", "wind-banner"] as const;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
      {dir === "left" ? (
        <path d="m14.5 5.5-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m9.5 5.5 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function HomeFeaturedProductsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const items = HOME_FEATURED_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(
    (p): p is Product => Boolean(p),
  );

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const amount = Math.max(Math.round(el.clientWidth * 0.72), 200) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-6 lg:p-8",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.35)]",
      )}
      aria-labelledby="home-featured-heading"
    >
      <div className="mx-auto min-w-0 max-w-[1600px]">
        <h2
          id="home-featured-heading"
          className="font-display text-balance text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-white"
        >
          Os mais pedidos
        </h2>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-white/70 sm:mt-3 md:text-lg">
          Selecione e personalize em poucos passos.
        </p>

        <div className="relative mt-5 min-w-0 sm:mt-6">
          <button
            type="button"
            aria-label="Ver produtos anteriores"
            onClick={() => scrollByDir(-1)}
            className="focus-ring absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#05070d]/80 text-white/85 shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 hover:border-cyan-400/45 hover:text-white lg:flex"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Ver proximos produtos"
            onClick={() => scrollByDir(1)}
            className="focus-ring absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#05070d]/80 text-white/85 shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 hover:border-cyan-400/45 hover:text-white lg:flex"
          >
            <Chevron dir="right" />
          </button>

          <div
            ref={scrollerRef}
            className={cn(
              "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 pt-0.5",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "lg:gap-4 lg:px-12",
            )}
          >
            {items.map((product) => {
              const image = getProductPrimaryImagePath(product.slug) ?? "/criativo1.png";
              return (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  data-card
                  className={cn(
                    "group snap-start shrink-0",
                    "w-[min(88vw,18.5rem)] sm:w-[min(42vw,17rem)] md:w-[min(31vw,18rem)]",
                    "lg:w-[calc((100%-3rem)/4)] lg:max-w-none",
                  )}
                >
                  <article
                    className={cn(
                      "flex h-full flex-col overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.07] via-[#05070d]/95 to-[#080c14] backdrop-blur-xl transition-all duration-300 ease-out",
                      "hover:scale-[1.05] hover:border-cyan-400/25 hover:shadow-[0_0_64px_rgba(56,189,248,0.22),0_24px_48px_rgba(0,0,0,0.35)]",
                    )}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#121722]">
                      <ProductRasterPicture
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 40vw, 25vw"
                        className="object-cover brightness-[1.03] contrast-[1.02] transition-all duration-500 ease-out group-hover:scale-[1.08] group-hover:brightness-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(5,7,13,0.72))]" />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:pt-3.5">
                      <h3 className="font-display text-lg font-semibold leading-[1.15] tracking-tight text-white sm:text-xl">
                        {product.name}
                      </h3>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-center sm:mt-7">
          <Link
            href="/produtos"
            className="home-btn-outline focus-ring inline-flex min-h-[48px] w-full max-w-[20rem] items-center justify-center px-8 sm:w-auto sm:min-w-[12.5rem]"
          >
            Ver mais
          </Link>
        </div>
      </div>
    </section>
  );
}
