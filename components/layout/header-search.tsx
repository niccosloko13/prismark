"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const popularTerms = ["Cartão de visita", "Adesivo", "Banner", "Folder"];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4.5 w-4.5">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.25 4.25" strokeLinecap="round" />
    </svg>
  );
}

export function HeaderSearch({
  mobile = false,
  className,
  onNavigate,
}: {
  mobile?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams, pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return popularTerms;
    }

    return popularTerms.filter((term) => term.toLowerCase().includes(normalizedQuery)).slice(0, 4);
  }, [query]);

  function navigate(term: string) {
    const trimmedTerm = term.trim();
    const href = trimmedTerm ? `/products?q=${encodeURIComponent(trimmedTerm)}` : "/products";

    setIsFocused(false);
    onNavigate?.();
    router.push(href);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(query);
  }

  return (
    <div ref={containerRef} className={cn("relative", mobile ? "w-full" : "min-w-[16rem]", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor={mobile ? "mobile-header-search" : "desktop-header-search"} className="sr-only">
          Buscar produtos
        </label>
        <input
          id={mobile ? "mobile-header-search" : "desktop-header-search"}
          type="search"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="O que você está procurando?"
          className={cn(
            "focus-ring w-full rounded-full border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,248,249,0.94))] text-sm text-ink shadow-[0_14px_30px_rgba(15,15,15,0.05)] outline-none transition placeholder:text-black/34",
            "pr-12",
            mobile
              ? "h-12 px-4 text-[0.95rem]"
              : "h-[48px] px-4 text-[0.92rem] hover:border-black/16 focus:border-cyan/26",
          )}
        />
        <button
          type="submit"
          aria-label="Pesquisar produtos"
          className={cn(
            "focus-ring absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full transition",
            mobile
              ? "h-9 w-9 bg-ink text-white shadow-[0_12px_24px_rgba(15,15,15,0.18)] hover:bg-black"
              : "h-9 w-9 bg-black/[0.04] text-black/60 hover:bg-black/[0.08] hover:text-ink",
          )}
        >
          <SearchIcon />
        </button>
      </form>

      {isFocused && filteredSuggestions.length > 0 ? (
        <div
          className={cn(
            "z-30 rounded-[24px] border border-black/8 bg-white/98 shadow-[0_22px_56px_rgba(15,15,15,0.12)] backdrop-blur-xl",
            mobile ? "mt-3 p-3" : "absolute left-0 right-0 top-[calc(100%+0.7rem)] p-3",
          )}
        >
          <p className="px-1 text-[0.67rem] font-semibold uppercase tracking-[0.22em] text-black/42">
            Buscas rápidas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {filteredSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigate(term)}
                className="focus-ring rounded-full border border-black/10 bg-black/[0.02] px-3.5 py-2 text-sm font-medium text-ink transition hover:border-black/18 hover:bg-black/[0.05]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
