import Link from "next/link";

import { companyLinks } from "@/lib/company";
import { cn } from "@/lib/utils";

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ElectionMobileStickyCta() {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 lg:hidden",
        "pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2",
      )}
    >
      <div className="pointer-events-auto mx-auto max-w-[1600px] px-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-[#050818]/95 p-3 shadow-[0_-12px_48px_rgba(0,0,0,0.55),0_0_40px_rgba(250,204,21,0.1)] backdrop-blur-xl">
          <Link
            href="#materiais"
            className={cn(
              "focus-ring flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-wide text-[#0d0d0d]",
              "bg-gradient-to-br from-yellow-300 via-amber-300 to-yellow-500",
              "shadow-[0_0_28px_rgba(250,204,21,0.35)] active:scale-[0.99]",
            )}
          >
            Ver materiais
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={companyLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "focus-ring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-yellow-400/55 py-2.5 text-xs font-bold text-white",
              "hover:bg-white/[0.06]",
            )}
          >
            Falar no WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
