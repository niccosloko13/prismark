"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { companyLinks } from "@/lib/company";
import { cn } from "@/lib/utils";

/** Altura aproximada das barras fixas de CTA no mobile (produto / carrinho / checkout). */
function useMobileFabBottomOffset() {
  const pathname = usePathname() ?? "";
  if (/^\/products\/[^/]+$/.test(pathname)) {
    return "max-lg:bottom-[calc(env(safe-area-inset-bottom)+15.75rem)]";
  }
  if (pathname === "/cart" || pathname === "/order") {
    return "max-lg:bottom-[calc(env(safe-area-inset-bottom)+13.25rem)]";
  }
  return "max-lg:bottom-[calc(env(safe-area-inset-bottom)+5.75rem)]";
}

export function WhatsAppFloat() {
  const bottomOffset = useMobileFabBottomOffset();

  return (
    <Link
      href={companyLinks.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a Prismarq no WhatsApp"
      className={cn(
        "focus-ring fixed right-3 z-[40] flex items-center justify-center shadow-[0_12px_32px_rgba(15,15,15,0.2)] transition duration-200 hover:brightness-[1.03] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:brightness-100 motion-reduce:active:scale-100",
        bottomOffset,
        "h-11 w-11 rounded-full border border-white/22 bg-[#25D366] text-white lg:h-auto lg:w-auto lg:min-h-[44px] lg:rounded-full lg:border-0 lg:bg-gradient-to-r lg:from-pink-500 lg:via-purple-500 lg:to-cyan-400 lg:px-5 lg:py-3 lg:text-white lg:shadow-[0_4px_28px_rgba(236,72,153,0.35),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_40px_rgba(56,189,248,0.12)]",
        "lg:bottom-8 lg:right-5 lg:max-w-[calc(100vw-2rem)] lg:gap-2",
        "max-lg:p-0 lg:gap-2",
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/18 text-[0.65rem] font-black text-white lg:bg-emerald-500 lg:text-[0.7rem]">
        WA
      </span>
      <span className="max-lg:sr-only truncate text-sm font-semibold lg:text-[0.95rem]">WhatsApp</span>
    </Link>
  );
}
