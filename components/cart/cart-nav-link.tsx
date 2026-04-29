"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M3.75 4.75h1.5l1.2 8.1a2 2 0 0 0 1.98 1.7h7.98a2 2 0 0 0 1.94-1.5l1.4-5.6H7.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function CartNavLink({
  className,
  compact = false,
  headerOnDark = false,
  /** Pill do mockup mobile: ícone | divisor | contador, altura ~52–56px. Só use no header mobile storefront. */
  mobileHeaderPill = false,
}: {
  className?: string;
  compact?: boolean;
  /** Header da home escura: contraste no estado vazio. */
  headerOnDark?: boolean;
  mobileHeaderPill?: boolean;
}) {
  const { itemCount, isReady } = useCart();
  const hasItems = isReady && itemCount > 0;

  if (mobileHeaderPill && headerOnDark) {
    return (
      <Link
        href="/cart"
        className={cn(
          "focus-ring inline-flex h-[52px] max-h-[60px] shrink-0 items-center gap-2.5 rounded-full border border-white/18 bg-white/[0.07] px-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1]",
          hasItems && "border-fuchsia-400/25 shadow-[0_0_24px_rgba(168,85,247,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]",
          className,
        )}
        aria-label={`Abrir carrinho com ${isReady ? itemCount : 0} item(ns)`}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center text-white [&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]">
          <CartIcon />
        </span>
        <span className="h-5 w-px shrink-0 bg-white/22" aria-hidden />
        <span className="min-w-[1.25rem] text-center text-[0.9375rem] font-semibold tabular-nums text-white">
          {isReady ? itemCount : "0"}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className={cn(
        "focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border text-sm font-semibold transition duration-200",
        compact ? "max-lg:min-h-10 max-lg:px-2 max-lg:py-1.5 px-2.5 py-2" : "px-3.5 py-2",
        hasItems
          ? headerOnDark
            ? "border-white/15 bg-white/[0.1] text-white shadow-[0_8px_32px_rgba(236,72,153,0.2),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-xl hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_12px_40px_rgba(56,189,248,0.22)]"
            : "border-ink/12 bg-ink text-white shadow-[0_14px_36px_rgba(15,15,15,0.16)] hover:-translate-y-0.5 hover:bg-ink"
          : headerOnDark
            ? "border-white/8 bg-white/[0.04] text-white backdrop-blur-xl hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-[0_0_28px_rgba(0,181,255,0.15)]"
            : "border-black/10 bg-white text-ink hover:-translate-y-0.5 hover:border-black/16 hover:shadow-[0_12px_28px_rgba(15,15,15,0.08)]",
        className,
      )}
      aria-label={`Abrir carrinho com ${isReady ? itemCount : 0} item(ns)`}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          compact ? "h-8 w-8" : "h-9 w-9",
          hasItems ? "bg-white/18" : headerOnDark ? "bg-white/10" : "bg-black/[0.04]",
        )}
      >
        <CartIcon />
      </span>
      {!compact ? <span className="hidden sm:inline">Carrinho</span> : null}
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full px-2 py-1 text-[0.68rem] font-semibold",
          compact ? "min-w-6" : "min-w-7",
          hasItems
            ? headerOnDark
              ? "bg-white/20 text-white ring-1 ring-white/25"
              : "bg-white text-ink"
            : headerOnDark
              ? "bg-white/15 text-white/90"
              : "bg-black/6 text-black/56",
        )}
      >
        {isReady ? itemCount : "0"}
      </span>
    </Link>
  );
}
