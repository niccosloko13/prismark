"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/common/badge";
import { cn } from "@/lib/utils";

export interface HomeHeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  tone?: "cyan" | "magenta" | "yellow";
  highlights: string[];
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      {direction === "left" ? (
        <path d="m14.5 5.5-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m9.5 5.5 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function HomeHeroCarousel({ slides }: { slides: HomeHeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  if (!activeSlide) {
    return null;
  }

  return (
    <section className="panel relative overflow-hidden p-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(0,181,255,0.06),transparent_24%),radial-gradient(circle_at_88%_18%,rgba(255,46,191,0.05),transparent_20%),radial-gradient(circle_at_76%_84%,rgba(255,211,0,0.07),transparent_16%)]" />
      <div className="relative grid min-h-[420px] lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="label-kicker">{activeSlide.eyebrow}</p>
              {activeSlide.badge ? <Badge tone={activeSlide.tone ?? "cyan"}>{activeSlide.badge}</Badge> : null}
            </div>

            <h1 className="display-title mt-5 max-w-2xl break-words text-[clamp(2.2rem,6.8vw,4.9rem)] font-semibold leading-[1.03] tracking-tight text-balance text-white">
              {activeSlide.title}
            </h1>
            <p className="mt-5 max-w-xl text-[0.97rem] leading-7 text-white/70 sm:text-[1.02rem]">
              {activeSlide.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={activeSlide.primaryHref} className="home-btn-gradient focus-ring">
                {activeSlide.primaryLabel}
              </Link>
              <Link href={activeSlide.secondaryHref} className="home-btn-outline focus-ring">
                {activeSlide.secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {activeSlide.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[24px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-medium leading-6 text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
              <div className="flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Ir para slide ${index + 1}`}
                    aria-pressed={index === activeIndex}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "focus-ring flex h-10 items-center rounded-full border px-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300",
                      index === activeIndex
                        ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/30 to-blue-500/25 text-white shadow-[0_12px_24px_rgba(0,181,255,0.2)]"
                        : "border-white/12 bg-white/[0.06] text-white/55 hover:border-white/22 hover:text-white/85",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Slide anterior"
                  onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white/80 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/12 hover:text-white"
                >
                  <Arrow direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Próximo slide"
                  onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white/80 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/12 hover:text-white"
                >
                  <Arrow direction="right" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/8 lg:border-l lg:border-t-0">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,181,255,0.08),rgba(5,7,13,0.4),rgba(255,46,191,0.06))]" />
          <div className="relative h-full min-h-[310px] p-3 sm:p-5 lg:p-6">
            <div className="relative h-full overflow-hidden rounded-[32px] border border-white/8 bg-white/[0.04] shadow-[0_26px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
                  <span className="h-2.5 w-2.5 rounded-full bg-magenta" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow" />
                </div>
                <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Banner principal
                </span>
              </div>

              <div className="relative h-full min-h-[300px]">
                <Image
                  src={activeSlide.imageSrc}
                  alt={activeSlide.imageAlt}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover object-center"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="grid gap-3 rounded-[28px] border border-white/18 bg-black/42 p-4 text-white backdrop-blur-md sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/62">Campanha ativa</p>
                    <p className="mt-2 max-w-[30rem] text-sm leading-6 text-white/84">
                      Estrutura pronta para promoções, lançamentos e destaques comerciais em formato de vitrine principal.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">
                    1140 x 320
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
