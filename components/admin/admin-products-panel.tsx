"use client";

import { useMemo, useState, useTransition } from "react";

import { formatCurrencyBRL } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductOverride } from "@/server/repositories/product-overrides.repository";

export function AdminProductsPanel({
  catalog,
  orderCountBySlug,
  initialOverrides,
}: {
  catalog: Product[];
  orderCountBySlug: Record<string, number>;
  initialOverrides: ProductOverride[];
}) {
  const [overrides, setOverrides] = useState(() => new Map(initialOverrides.map((o) => [o.productSlug, o])));
  const [draftPrice, setDraftPrice] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const merged = useMemo(() => {
    return catalog.map((p) => {
      const o = overrides.get(p.slug);
      return {
        product: p,
        isActive: o?.isActive !== false,
        price: o?.basePriceM2 ?? p.basePriceM2,
        featured: o?.featured ?? p.featured,
      };
    });
  }, [catalog, overrides]);

  function save(slug: string, isActive: boolean, basePriceM2: number | null, featured: boolean | null) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/product-overrides", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSlug: slug, isActive, basePriceM2, featured }),
        });
        const data = (await res.json()) as { message?: string; overrides?: ProductOverride[] };
        if (!res.ok) {
          throw new Error(data.message ?? "Falha ao salvar.");
        }
        if (data.overrides) {
          setOverrides(new Map(data.overrides.map((o) => [o.productSlug, o])));
        }
        setMessage(`Produto ${slug} atualizado.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Preço e destaque sobrescrevem o catálogo base. Desativar remove o item da vitrine (pastas em{" "}
        <code className="text-cyan-200">/public/product</code>).
      </p>
      <div className="min-h-6 text-sm">
        {error ? <p className="text-red-300">{error}</p> : null}
        {message ? <p className="text-emerald-300">{message}</p> : null}
      </div>

      <div className="grid gap-4">
        {merged.map(({ product, isActive, price, featured }) => (
          <article
            key={product.slug}
            className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{product.name}</p>
                <p className="text-sm text-white/55">
                  {product.slug} · {product.category} · Pedidos: {orderCountBySlug[product.slug] ?? 0}
                </p>
              </div>
              <span
                className={
                  isActive
                    ? "rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200"
                    : "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/50"
                }
              >
                {isActive ? "Ativo na loja" : "Desativado"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-1 text-sm text-white/70">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Preço m² (R$)</span>
                <input
                  type="number"
                  step="0.01"
                  value={
                    draftPrice[product.slug] ??
                    (price !== product.basePriceM2 ? String(price) : String(product.basePriceM2))
                  }
                  onChange={(e) => setDraftPrice((d) => ({ ...d, [product.slug]: e.target.value }))}
                  className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white"
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const raw = draftPrice[product.slug];
                    const num = raw != null && raw !== "" ? Number(raw) : NaN;
                    const custom = Number.isFinite(num) && num !== product.basePriceM2 ? num : null;
                    const o = overrides.get(product.slug);
                    save(product.slug, isActive, custom, o?.featured ?? null);
                  }}
                  className="focus-ring rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Aplicar preço
                </button>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  const o = overrides.get(product.slug);
                  save(product.slug, !isActive, o?.basePriceM2 ?? null, o?.featured ?? null);
                }}
                className="focus-ring self-end rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white"
              >
                {isActive ? "Desativar na loja" : "Ativar na loja"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  const o = overrides.get(product.slug);
                  const currentFeatured = o?.featured ?? product.featured;
                  save(product.slug, isActive, o?.basePriceM2 ?? null, !currentFeatured);
                }}
                className="focus-ring self-end rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white"
              >
                {featured ? "Remover destaque" : "Marcar destaque"}
              </button>
            </div>
            <p className="mt-2 text-xs text-white/45">Referência catálogo: {formatCurrencyBRL(product.basePriceM2)}/m²</p>
          </article>
        ))}
      </div>
    </div>
  );
}
