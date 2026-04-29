import Link from "next/link";

import { SectionShell } from "@/components/common/section-shell";
import { companyContactChannels, companyLinks, companyProfile } from "@/lib/company";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <section className="panel p-6 sm:p-8 lg:p-10">
        <p className="label-kicker">Contato</p>
        <h1 className="display-title mt-3 max-w-4xl text-[clamp(2.5rem,4vw,4.25rem)] font-semibold leading-[0.95] tracking-tight text-balance text-white">
          Atendimento comercial e suporte com presença institucional real.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
          Fale com a Prismarq para briefing, orçamento, pedido online, revisão de arte e acompanhamento de produção.
        </p>
      </section>

      <SectionShell
        eyebrow="Canais"
        title="Fale com a Prismarq"
        description="Os canais abaixo já estão prontos para atendimento comercial, contato institucional e localização da empresa."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {companyContactChannels.map((channel) => (
            <Link
              key={channel.title}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              className="panel p-5 shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-white/16 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            >
              <p className="label-kicker">{channel.title}</p>
              <p className="mt-4 text-lg font-semibold leading-7 text-white">{channel.value}</p>
            </Link>
          ))}
        </div>
      </SectionShell>

      <section className="panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="label-kicker">Dados da empresa</p>
            <h2 className="display-title mt-3 text-[clamp(2rem,3vw,3rem)] font-semibold tracking-tight text-balance">
              {companyProfile.legalName}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">{companyProfile.supportLine}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-soft p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/48">Endereço</p>
              <p className="mt-3 text-sm font-medium leading-6 text-white">
                {companyProfile.addressLine}
                <br />
                {companyProfile.cityState}
              </p>
              <p className="mt-2 text-xs text-white/55">CEP {companyProfile.postalCode}</p>
            </div>

            <div className="surface-soft p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/48">Contato direto</p>
              <p className="mt-3 text-sm font-medium text-white">{companyProfile.phoneDisplay}</p>
              <p className="mt-2 break-all text-sm text-white/65">{companyProfile.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={companyLinks.whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary focus-ring">
                  WhatsApp
                </Link>
                <Link href={companyLinks.email} className="btn btn-secondary focus-ring">
                  Enviar e-mail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
