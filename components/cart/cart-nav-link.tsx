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
}: {
  className?: string;
  compact?: boolean;
}) {
  const { itemCount, isReady } = useCart();
  const hasItems = isReady && itemCount > 0;

  return (
    <Link
      href="/cart"
      className={cn(
        "focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border text-sm font-semibold transition duration-200",
        compact ? "px-2.5 py-2" : "px-3.5 py-2",
        hasItems
          ? "border-ink/12 bg-ink text-white shadow-[0_14px_36px_rgba(15,15,15,0.16)] hover:-translate-y-0.5 hover:bg-ink"
          : "border-black/10 bg-white text-ink hover:-translate-y-0.5 hover:border-black/16 hover:shadow-[0_12px_28px_rgba(15,15,15,0.08)]",
        className,
      )}
      aria-label={`Abrir carrinho com ${isReady ? itemCount : 0} item(ns)`}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          compact ? "h-8 w-8" : "h-9 w-9",
          hasItems ? "bg-white/12" : "bg-black/[0.04]",
        )}
      >
        <CartIcon />
      </span>
      {!compact ? <span className="hidden sm:inline">Carrinho</span> : null}
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full px-2 py-1 text-[0.68rem] font-semibold",
          compact ? "min-w-6" : "min-w-7",
          hasItems ? "bg-white text-ink" : "bg-black/6 text-black/56",
        )}
      >
        {isReady ? itemCount : "0"}
      </span>
    </Link>
  );
}
