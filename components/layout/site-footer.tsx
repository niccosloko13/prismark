import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { companyFooterLinks, companyLinks, companyProfile } from "@/lib/company";

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
  return (
    <footer className="mt-10 pb-8">
      <div className="panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr_0.55fr]">
          <div>
            <BrandLogo size="xl" className="focus-ring rounded-[30px]" />
            <p className="label-kicker mt-5">Comunicação visual</p>
            <h2 className="display-title mt-3 max-w-xl text-[1.8rem] font-semibold tracking-tight text-balance sm:text-[2.15rem]">
              {companyProfile.legalName}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-black/64">{companyProfile.shortTrustLine}</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-black/56">{companyProfile.supportLine}</p>
          </div>

          <div>
            <p className="label-kicker">Contato</p>
            <div className="mt-4 space-y-3">
              {footerContacts.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="surface-soft block p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,15,15,0.07)]"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/46">{item.title}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-ink">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-black/54">{item.note}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="label-kicker">Links úteis</p>
            <div className="mt-4 space-y-2">
              {companyFooterLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-black/18 hover:shadow-[0_12px_26px_rgba(15,15,15,0.06)]"
                >
                  {item.label}
                  <span className="text-black/34">{">"}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-black/8 pt-5 text-sm text-black/54 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {companyProfile.legalName}. Todos os direitos reservados.</p>
          <p>
            {companyProfile.cityState} • CEP {companyProfile.postalCode}
          </p>
        </div>
      </div>
    </footer>
  );
}
