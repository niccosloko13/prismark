"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/layout/brand-logo";
import { companyFooterLinks, companyLinks, companyProfile } from "@/lib/company";
import { cn } from "@/lib/utils";

const footerContacts = [
  {
    title: "WhatsApp",
    value: companyProfile.phoneDisplay,
    note: "Atendimento direto para orçamento e pedido online.",
    href: companyLinks.whatsapp,
    external: true,
  },
  {
    title: "E-mail",
    value: companyProfile.email,
    note: "Canal institucional e comercial da Prismarq.",
    href: companyLinks.email,
    external: false,
  },
  {
    title: "Endereço",
    value: `${companyProfile.addressLine} • ${companyProfile.cityState}`,
    note: `CEP ${companyProfile.postalCode}`,
    href: `https://www.google.com/maps/search/?api=1&query=${companyLinks.mapsQuery}`,
    external: true,
  },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  const isStorefront = !pathname.startsWith("/admin");

  return (
    <footer
      className={cn(
        "mt-8 pb-6 sm:mt-10 sm:pb-8",
        isStorefront &&
          "mt-10 rounded-t-[28px] border-t border-white/8 bg-[#05070d] pt-8 sm:mt-12 sm:rounded-t-[32px] sm:pt-10",
      )}
    >
      <div
        className={cn(
          "p-4 sm:p-8 lg:p-10",
          isStorefront
            ? "rounded-[22px] border border-white/8 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.35),0_0_48px_rgba(168,85,247,0.06)] backdrop-blur-xl sm:rounded-[28px] xl:rounded-[34px]"
            : "panel p-4 sm:p-8 lg:p-10",
        )}
      >
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr_0.55fr]">
          <div className="min-w-0">
            <div
              className={cn(
                "inline-flex max-w-full rounded-[22px] border px-4 py-3 sm:rounded-[26px] sm:px-5 sm:py-4",
                isStorefront
                  ? "border-white/8 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
                  : "border-[#E5E7EB] bg-[#F3F4F6] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
              )}
            >
              <BrandLogo size="xl" className="focus-ring" onDark={isStorefront} />
            </div>
            <p className={cn("label-kicker mt-5", isStorefront && "!text-cyan-300/80")}>Comunicação visual</p>
            <h2
              className={cn(
                "display-title mt-3 max-w-xl text-balance text-[1.55rem] font-semibold leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.15rem]",
                isStorefront ? "text-white" : "",
              )}
            >
              {companyProfile.legalName}
            </h2>
            <p
              className={cn(
                "mt-3 max-w-xl text-[0.9375rem] leading-relaxed sm:mt-4 sm:text-sm sm:leading-7",
                isStorefront ? "text-white/72" : "text-black/64",
              )}
            >
              {companyProfile.shortTrustLine}
            </p>
            <p
              className={cn(
                "mt-2 max-w-xl text-[0.9375rem] leading-relaxed sm:mt-3 sm:text-sm sm:leading-7",
                isStorefront ? "text-white/65" : "text-black/56",
              )}
            >
              {companyProfile.supportLine}
            </p>
          </div>

          <div className="min-w-0">
            <p className={cn("label-kicker", isStorefront && "!text-cyan-300/80")}>Contato</p>
            <div className="mt-4 space-y-3">
              {footerContacts.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className={cn(
                    "surface-soft block p-4 transition hover:-translate-y-0.5",
                    isStorefront
                      ? "border-white/8 bg-white/[0.04] backdrop-blur-xl hover:border-white/15 hover:shadow-[0_16px_34px_rgba(0,0,0,0.35)]"
                      : "hover:shadow-[0_16px_34px_rgba(15,15,15,0.07)]",
                  )}
                >
                  <p
                    className={cn(
                      "text-[0.68rem] font-semibold uppercase tracking-[0.22em]",
                      isStorefront ? "text-white/50" : "text-black/46",
                    )}
                  >
                    {item.title}
                  </p>
                  <p className={cn("mt-3 text-sm font-semibold leading-6", isStorefront ? "text-white" : "text-ink")}>
                    {item.value}
                  </p>
                  <p className={cn("mt-2 text-xs leading-5", isStorefront ? "text-white/60" : "text-black/54")}>{item.note}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <p className={cn("label-kicker", isStorefront && "!text-cyan-300/80")}>Links úteis</p>
            <div className="mt-4 space-y-2">
              {companyFooterLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
                    isStorefront
                      ? "border-white/8 bg-white/[0.04] text-white backdrop-blur-xl hover:border-white/15 hover:shadow-[0_12px_26px_rgba(0,0,0,0.3)]"
                      : "border-black/10 bg-white text-ink hover:border-black/18 hover:shadow-[0_12px_26px_rgba(15,15,15,0.06)]",
                  )}
                >
                  {item.label}
                  <span className={isStorefront ? "text-white/40" : "text-black/34"}>{">"}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-6 flex flex-col gap-2 border-t pt-4 text-center text-[0.8125rem] leading-relaxed sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-5 sm:text-left sm:text-sm",
            isStorefront ? "border-white/8 text-white/55" : "border-black/8 text-black/54",
          )}
        >
          <p>
            © {new Date().getFullYear()} {companyProfile.legalName}. Todos os direitos reservados.
          </p>
          <p>
            {companyProfile.cityState} • CEP {companyProfile.postalCode}
          </p>
        </div>
      </div>
    </footer>
  );
}
