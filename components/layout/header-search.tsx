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
  tone = "light",
}: {
  mobile?: boolean;
  className?: string;
  onNavigate?: () => void;
  tone?: "light" | "dark";
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
    const href = trimmedTerm ? `/produtos?q=${encodeURIComponent(trimmedTerm)}` : "/produtos";

    setIsFocused(false);
    onNavigate?.();
    router.push(href);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(query);
  }

  return (
    <div ref={containerRef} className={cn("relative min-w-0", mobile ? "w-full" : "w-full", className)}>
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
            "focus-ring w-full rounded-full border text-sm shadow-[0_14px_30px_rgba(15,15,15,0.05)] outline-none transition pr-12",
            tone === "dark"
              ? "border-white/8 bg-white/[0.04] text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-xl placeholder:text-white/45 hover:border-white/20 focus:border-cyan-400/45"
              : "border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,248,249,0.94))] text-ink placeholder:text-black/34 hover:border-black/16 focus:border-cyan/26",
            mobile
              ? "h-12 px-4 text-[0.95rem]"
              : "h-[48px] px-4 text-[0.92rem]",
          )}
        />
        <button
          type="submit"
          aria-label="Pesquisar produtos"
          className={cn(
            "focus-ring absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition",
            tone === "dark"
              ? "bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white shadow-[0_8px_22px_rgba(168,85,247,0.4)] hover:brightness-110"
              : mobile
                ? "bg-ink text-white shadow-[0_12px_24px_rgba(15,15,15,0.18)] hover:bg-black"
                : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08] hover:text-ink",
          )}
        >
          <SearchIcon />
        </button>
      </form>

      {isFocused && filteredSuggestions.length > 0 ? (
        <div
          className={cn(
            "z-30 rounded-[24px] border shadow-[0_22px_56px_rgba(15,15,15,0.12)] backdrop-blur-xl",
            tone === "dark"
              ? "border-white/8 bg-white/[0.04] text-white backdrop-blur-xl"
              : "border-black/8 bg-white/98",
            mobile ? "mt-3 p-3" : "absolute left-0 right-0 top-[calc(100%+0.7rem)] p-3",
          )}
        >
          <p
            className={cn(
              "px-1 text-[0.67rem] font-semibold uppercase tracking-[0.22em]",
              tone === "dark" ? "text-white/45" : "text-black/42",
            )}
          >
            Buscas rápidas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {filteredSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => navigate(term)}
                className={cn(
                  "focus-ring rounded-full border px-3.5 py-2 text-sm font-medium transition",
                  tone === "dark"
                    ? "border-white/15 bg-white/5 text-white/90 hover:border-cyan-400/40 hover:bg-white/10"
                    : "border-black/10 bg-black/[0.02] text-ink hover:border-black/18 hover:bg-black/[0.05]",
                )}
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
