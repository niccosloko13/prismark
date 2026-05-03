import Link from "next/link";

import { companyLinks } from "@/lib/company";
import { cn } from "@/lib/utils";

const whatsappSolicitarHref = `${companyLinks.whatsapp.split("?")[0]}?text=${encodeURIComponent(
  "Olá, Prismarq! Quero solicitar material de campanha para a Eleição 2026.",
)}`;

function IconRocket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3c2.5 3.2 4 6.8 4 10.5 0 1.6-.2 3.1-.6 4.5l-1.4-1.4c.2-.9.4-2 .4-3.1 0-2.8-1-5.6-2.8-8-1.8 2.4-2.8 5.2-2.8 8 0 1.1.2 2.2.4 3.1l-1.4 1.4c-.4-1.4-.6-2.9-.6-4.5C8 9.8 9.5 6.2 12 3Z"
        fill="currentColor"
      />
      <path d="M12 22v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3 5 6v6c0 5 4 8 7 9 3-1 7-4 7-9V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function ElectionHero({ className }: { className?: string }) {
  return (
    <section className={cn("relative z-[1] min-w-0", className)}>
      <p
        className={cn(
          "inline-flex items-center rounded-full border border-yellow-400/50 bg-yellow-400/15 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-yellow-300",
          "shadow-[0_0_24px_rgba(250,204,21,0.35)]",
        )}
      >
        Impulsione sua campanha
      </p>

      <h1 className="mt-5 text-[clamp(2.5rem,7.5vw,4.5rem)] font-black uppercase leading-[0.92] tracking-tight text-balance">
        <span className="text-white">Eleição</span>{" "}
        <span className="bg-gradient-to-br from-yellow-300 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(250,204,21,0.45)]">
          2026
        </span>
      </h1>
      <p className="mt-3 text-[clamp(1.05rem,3vw,1.5rem)] font-black uppercase leading-tight tracking-wide text-white">
        Material de campanha{" "}
        <span className="bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">profissional</span>
      </p>
      <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/75 sm:text-lg">
        Produção rápida, qualidade premium e alta visibilidade para candidatos e equipes.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/25 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[#0a0f1f] shadow-[0_0_20px_rgba(250,204,21,0.55)]"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="text-sm font-bold uppercase leading-snug tracking-wide text-white sm:text-base">
          Oferecemos pacotes completos para sua eleição!
        </p>
      </div>

      <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <li className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]">
            <IconRocket className="h-5 w-5" />
          </span>
          Produção expressa
        </li>
        <li className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.25)]">
            <IconShield className="h-5 w-5" />
          </span>
          Alta durabilidade
        </li>
        <li className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.25)]">
            <IconBolt className="h-5 w-5" />
          </span>
          Ideal para campanhas
        </li>
      </ul>

      <div className="mt-8 hidden flex-col gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={whatsappSolicitarHref}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-black uppercase tracking-wide text-[#1a0505]",
            "bg-gradient-to-r from-red-600 via-red-500 to-amber-400",
            "shadow-[0_0_40px_rgba(239,68,68,0.45),0_12px_40px_rgba(0,0,0,0.35)]",
            "transition hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_0_56px_rgba(250,204,21,0.5),0_16px_48px_rgba(0,0,0,0.4)]",
          )}
        >
          Solicitar material agora
          <IconArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href={companyLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-yellow-400/70 bg-transparent px-6 py-3.5 text-sm font-bold text-white",
            "shadow-[0_0_24px_rgba(250,204,21,0.15)] backdrop-blur-sm transition",
            "hover:border-yellow-300 hover:bg-white/[0.06] hover:shadow-[0_0_32px_rgba(250,204,21,0.35)]",
          )}
        >
          <IconWhatsApp className="h-5 w-5 text-[#25D366]" />
          Falar no WhatsApp
        </Link>
      </div>
    </section>
  );
}

export { whatsappSolicitarHref };
