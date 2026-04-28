import Link from "next/link";

import { companyLinks } from "@/lib/company";

export function WhatsAppFloat() {
  return (
    <Link
      href={companyLinks.whatsapp}
      target="_blank"
      rel="noreferrer"
      className="btn btn-primary focus-ring fixed bottom-24 right-3 z-50 max-w-[min(100%,calc(100vw-1.75rem))] gap-2 px-3 py-2.5 shadow-[0_18px_42px_rgba(15,15,15,0.2)] sm:bottom-5 sm:right-5 sm:max-w-[calc(100vw-2rem)] sm:px-5 sm:py-3"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-[0.7rem] font-black text-white sm:h-8 sm:w-8 sm:text-xs">
        WA
      </span>
      <span className="truncate text-sm sm:text-[0.95rem]">WhatsApp</span>
    </Link>
  );
}
