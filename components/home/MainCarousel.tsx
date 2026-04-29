"use client";

import Image from "next/image";
import Link from "next/link";
import type { TouchEvent } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface MainCarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  href: string;
  imageAlt?: string;
  backgroundColor?: string;
  badge?: string;
  pricePrefix?: string;
  cta?: string;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      {direction === "left" ? (
        <path d="m14.5 5.5-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m9.5 5.5 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function MainCarousel({ slides, autoPlayMs = 5200 }: { slides: MainCarouselSlide[]; autoPlayMs?: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [preventClick, setPreventClick] = useState(false);

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, autoPlayMs);

    return () => window.clearInterval(interval);
  }, [autoPlayMs, isPaused, slides.length]);

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    if (slides.length <= 1) {
      return;
    }

    const point = event.touches[0];
    setTouchStartX(point.clientX);
    setTouchCurrentX(point.clientX);
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    if (touchStartX === null) {
      return;
    }

    setTouchCurrentX(event.touches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStartX === null || touchCurrentX === null) {
      setTouchStartX(null);
      setTouchCurrentX(null);
      return;
    }

    const deltaX = touchStartX - touchCurrentX;

    if (Math.abs(deltaX) > 44) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }

      setPreventClick(true);
      window.setTimeout(() => setPreventClick(false), 160);
    }

    setTouchStartX(null);
    setTouchCurrentX(null);
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className="relative"
      aria-label="Vitrine principal da Prismarq"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      <div className="panel overflow-hidden p-0">
        <div className="relative aspect-[16/11] min-h-[196px] sm:aspect-[18/8] sm:min-h-[252px] lg:aspect-[1140/320] lg:min-h-[320px]">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <Link
                key={slide.id}
                href={slide.href}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={(event) => {
                  if (preventClick) {
                    event.preventDefault();
                  }
                }}
                className={cn(
                  "absolute inset-0 transition-all duration-500 ease-out",
                  isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                )}
                style={{ background: slide.backgroundColor ?? "#111111" }}
              >
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt ?? slide.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 96vw, 1140px"
                    className="object-cover object-center"
                  />
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.82)_0%,rgba(10,10,10,0.56)_38%,rgba(10,10,10,0.18)_68%,rgba(10,10,10,0)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_42%,rgba(0,0,0,0.24)_100%)]" />

                <div className="relative flex h-full max-w-[56rem] flex-col justify-end p-4 sm:p-6 lg:p-10">
                  <div className="max-w-[19.5rem] sm:max-w-[28rem]">
                    <div className="flex flex-wrap items-center gap-2">
                      {slide.badge ? (
                        <span className="rounded-full border border-white/16 bg-white/14 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:px-3 sm:text-[0.68rem]">
                          {slide.badge}
                        </span>
                      ) : null}
                      {slide.pricePrefix ? (
                        <span className="rounded-full border border-cyan/20 bg-cyan/14 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/92 backdrop-blur-sm sm:px-3 sm:text-[0.68rem]">
                          {slide.pricePrefix}
                        </span>
                      ) : null}
                    </div>

                    <h1 className="display-title mt-3 max-w-[16rem] text-[clamp(1.45rem,5.2vw,3.4rem)] font-semibold leading-[0.98] tracking-tight text-white text-balance sm:mt-4 sm:max-w-[25rem]">
                      {slide.title}
                    </h1>

                    <p className="mt-3 hidden max-w-[30rem] text-sm leading-6 text-white/80 sm:block sm:text-[0.95rem]">
                      {slide.subtitle}
                    </p>

                    {slide.cta ? (
                      <span className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(168,85,247,0.35)] sm:mt-5">
                        {slide.cta}
                        <span className="text-white/80">{">"}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}

          {slides.length > 1 ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-4 sm:flex">
                <button
                  type="button"
                  aria-label="Slide anterior"
                  onClick={goToPrevious}
                  className="pointer-events-auto focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/28 text-white backdrop-blur-sm transition hover:bg-black/42"
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Próximo slide"
                  onClick={goToNext}
                  className="pointer-events-auto focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/28 text-white backdrop-blur-sm transition hover:bg-black/42"
                >
                  <ArrowIcon direction="right" />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-4 sm:bottom-4">
                <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-3 py-2 backdrop-blur-md">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={`Ir para o slide ${index + 1}`}
                      aria-pressed={index === activeIndex}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "focus-ring h-2.5 rounded-full transition-all duration-300",
                        index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/42 hover:bg-white/66",
                      )}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
