import Link from "next/link";

import { companyLinks } from "@/lib/company";

export function WhatsAppFloat() {
  return (
    <Link
      href={companyLinks.whatsapp}
      target="_blank"
      rel="noreferrer"
      className="btn btn-primary focus-ring fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] px-4 py-2.5 shadow-[0_18px_42px_rgba(15,15,15,0.2)] sm:bottom-5 sm:right-5 sm:px-5 sm:py-3"
      style={{ bottom: "max(1rem, calc(0.75rem + env(safe-area-inset-bottom)))" }}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-[0.7rem] font-black text-white sm:h-8 sm:w-8 sm:text-xs">
        WA
      </span>
      <span className="truncate text-sm sm:text-[0.95rem]">WhatsApp</span>
    </Link>
  );
}
