"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { AdminPixSettingsForm } from "@/components/admin/admin-pix-settings-form";
import { PIX_DISCOUNT_PERCENT } from "@/lib/pix-discount";
import type { PaymentSettingsRecord } from "@/types";

export type SiteSettingsFormState = {
  legalName: string;
  brandName: string;
  addressLine: string;
  cityState: string;
  postalCode: string;
  phoneDisplay: string;
  phoneDigits: string;
  email: string;
  shortTrustLine: string;
  supportLine: string;
  shippingFreeMinBrl: string;
  pixDiscountPercent: string;
  siteWhatsappDigits: string;
};

export function AdminSettingsTabs({
  initialSite,
  initialPix,
}: {
  initialSite: SiteSettingsFormState;
  initialPix: PaymentSettingsRecord | null;
}) {
  const [tab, setTab] = useState<"empresa" | "pix" | "frete">("empresa");
  const [site, setSite] = useState(initialSite);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  function saveSite() {
    setErr("");
    setMsg("");
    start(async () => {
      try {
        const res = await fetch("/api/admin/site-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            legalName: site.legalName,
            brandName: site.brandName,
            addressLine: site.addressLine,
            cityState: site.cityState,
            postalCode: site.postalCode,
            phoneDisplay: site.phoneDisplay,
            phoneDigits: site.phoneDigits,
            email: site.email,
            shortTrustLine: site.shortTrustLine,
            supportLine: site.supportLine,
            shippingFreeMinBrl: site.shippingFreeMinBrl ? Number(site.shippingFreeMinBrl) : null,
            siteWhatsappDigits: site.siteWhatsappDigits || null,
          }),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) {
          throw new Error(data.message ?? "Falha ao salvar.");
        }
        setMsg("Configurações salvas.");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Erro.");
      }
    });
  }

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setTab(id)}
      data-active={tab === id}
      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 data-[active=true]:border-cyan-400/35 data-[active=true]:bg-cyan-500/15 data-[active=true]:text-white"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabBtn("empresa", "Empresa e contatos")}
        {tabBtn("frete", "Frete e WhatsApp")}
        {tabBtn("pix", "Chave Pix")}
      </div>

      {tab === "empresa" ? (
        <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
          <p className="text-sm text-white/60">
            Estes dados alimentam textos institucionais e canais exibidos no site (complementam o código; persistidos no
            banco).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["legalName", "Razão social"],
                ["brandName", "Nome fantasia"],
                ["addressLine", "Endereço"],
                ["cityState", "Cidade / UF"],
                ["postalCode", "CEP"],
                ["phoneDisplay", "Telefone (exibição)"],
                ["phoneDigits", "Telefone (apenas dígitos, país)"],
                ["email", "E-mail"],
                ["shortTrustLine", "Linha de confiança curta"],
                ["supportLine", "Linha de suporte"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-1 text-sm text-white/75">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</span>
                <input
                  className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
                  value={site[key]}
                  onChange={(e) => setSite((s) => ({ ...s, [key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={saveSite}
            className="focus-ring mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white"
          >
            {pending ? "Salvando..." : "Salvar empresa e contatos"}
          </button>
          {err ? <p className="mt-3 text-sm text-red-300">{err}</p> : null}
          {msg ? <p className="mt-3 text-sm text-emerald-300">{msg}</p> : null}
        </section>
      ) : null}

      {tab === "frete" ? (
        <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
          <p className="text-sm text-white/60">
            Frete grátis a partir do valor informado (uso em regras de checkout quando integrado). WhatsApp exibido no site.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-white/75">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Frete grátis a partir de (R$)</span>
              <input
                className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
                value={site.shippingFreeMinBrl}
                onChange={(e) => setSite((s) => ({ ...s, shippingFreeMinBrl: e.target.value }))}
                placeholder="ex: 350"
              />
            </label>
            <div className="space-y-2 sm:col-span-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/45">
                Desconto Pix (%) — legado
              </span>
              <input
                readOnly
                disabled
                aria-readonly="true"
                title="Campo legado — não usado pela vitrine"
                className="focus-ring w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/50 opacity-70"
                value={site.pixDiscountPercent}
              />
              <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/95">
                Campo legado: o desconto Pix da loja está fixo no código em {PIX_DISCOUNT_PERCENT}%.
              </p>
            </div>
            <label className="space-y-1 text-sm text-white/75 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">WhatsApp site (só dígitos)</span>
              <input
                className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
                value={site.siteWhatsappDigits}
                onChange={(e) => setSite((s) => ({ ...s, siteWhatsappDigits: e.target.value }))}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={saveSite}
            className="focus-ring mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white"
          >
            {pending ? "Salvando..." : "Salvar frete e contatos"}
          </button>
          {err ? <p className="mt-3 text-sm text-red-300">{err}</p> : null}
          {msg ? <p className="mt-3 text-sm text-emerald-300">{msg}</p> : null}
        </section>
      ) : null}

      {tab === "pix" ? (
        <div className="space-y-3">
          <AdminPixSettingsForm initialSettings={initialPix} />
          <p className="text-sm text-white/55">
            Ferramentas avançadas de EMV:{" "}
            <Link href="/admin/pix-settings" className="font-semibold text-cyan-300 underline-offset-2 hover:underline">
              abrir página dedicada
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
