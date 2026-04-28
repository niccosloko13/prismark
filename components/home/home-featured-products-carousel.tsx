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
    <section className="panel relative overflow-hidden p-4 sm:p-6 lg:p-8" aria-labelledby="home-featured-heading">
      <div className="mx-auto min-w-0 max-w-[1600px]">
        <h2
          id="home-featured-heading"
          className="display-title text-balance text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink"
        >
          Produtos em destaque
        </h2>
        <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-black/58 sm:mt-3 sm:text-base">
          Escolha um produto e personalize seu pedido em poucos passos.
        </p>

        <div className="relative mt-5 min-w-0 sm:mt-6">
          <button
            type="button"
            aria-label="Ver produtos anteriores"
            onClick={() => scrollByDir(-1)}
            className="focus-ring absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black/65 shadow-[0_8px_24px_rgba(15,15,15,0.08)] backdrop-blur-sm transition hover:border-black/16 hover:text-ink lg:flex"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Ver proximos produtos"
            onClick={() => scrollByDir(1)}
            className="focus-ring absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black/65 shadow-[0_8px_24px_rgba(15,15,15,0.08)] backdrop-blur-sm transition hover:border-black/16 hover:text-ink lg:flex"
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
                      "flex h-full flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white",
                      "shadow-[0_10px_34px_rgba(15,15,15,0.06)] transition duration-300",
                      "hover:-translate-y-1 hover:border-black/14 hover:shadow-[0_22px_50px_rgba(15,15,15,0.11)]",
                    )}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[linear-gradient(180deg,rgba(250,250,251,0.96),rgba(244,245,247,0.9))]">
                      <ProductRasterPicture
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 40vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(15,15,15,0.45))] opacity-90" />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:pt-3.5">
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-black/45">{product.category}</p>
                      <h3 className="display-title mt-1.5 text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
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
            href="/products"
            className="focus-ring inline-flex min-h-[48px] w-full max-w-[20rem] items-center justify-center rounded-full border-2 border-ink bg-transparent px-8 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white sm:w-auto sm:min-w-[12.5rem]"
          >
            Ver mais
          </Link>
        </div>
      </div>
    </section>
  );
}
