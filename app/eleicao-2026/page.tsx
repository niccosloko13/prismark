import type { Metadata } from "next";

import { ElectionBenefits } from "@/components/election/election-benefits";
import { ElectionHero } from "@/components/election/election-hero";
import { ElectionMobileStickyCta } from "@/components/election/election-mobile-sticky-cta";
import { ElectionProducts } from "@/components/election/election-products";

export const metadata: Metadata = {
  title: "Eleição 2026 — Material de campanha | Prismarq",
  description:
    "Linha completa de materiais políticos: santinhos, banners, adesivos, bandeiras e mais. Produção rápida e qualidade premium para sua campanha.",
};

function ElectionPageBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-1/4 top-0 h-[120%] w-1/2 skew-x-[-18deg] bg-gradient-to-b from-red-600/25 via-transparent to-transparent blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-[100%] w-1/2 skew-x-[14deg] bg-gradient-to-t from-blue-600/20 via-transparent to-transparent blur-3xl" />
      <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-yellow-400/15 blur-[100px]" />
      <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(125deg, transparent, transparent 40px, rgba(250,204,21,0.12) 40px, rgba(250,204,21,0.12) 42px), repeating-linear-gradient(-125deg, transparent, transparent 48px, rgba(239,68,68,0.1) 48px, rgba(239,68,68,0.1) 50px)",
        }}
      />
    </div>
  );
}

export default function Eleicao2026Page() {
  return (
    <div className="relative min-w-0 pb-44 pt-2 sm:pb-10 lg:pb-10">
      <ElectionPageBackdrop />

      <div className="relative z-[1] mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-[#060b18]/80 p-5 shadow-[0_0_80px_rgba(37,99,235,0.12)] backdrop-blur-md sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12">
          <ElectionHero />
          <ElectionProducts />
        </div>
        <ElectionBenefits className="mt-2" />
      </div>

      <ElectionMobileStickyCta />
    </div>
  );
}
