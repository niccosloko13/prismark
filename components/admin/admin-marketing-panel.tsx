"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { CouponRecord, HomeFeaturedRecord, MarketingBannerRecord } from "@/server/repositories/marketing.repository";

export function AdminMarketingPanel() {
  const [featured, setFeatured] = useState<HomeFeaturedRecord[]>([]);
  const [banners, setBanners] = useState<MarketingBannerRecord[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const [newSlug, setNewSlug] = useState("");
  const [newBanner, setNewBanner] = useState({ title: "", imageUrl: "", href: "", sortOrder: "0" });
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    maxUses: "",
  });

  const load = useCallback(() => {
    start(async () => {
      try {
        const [f, b, c] = await Promise.all([
          fetch("/api/admin/marketing/featured").then((r) => r.json()),
          fetch("/api/admin/marketing/banners").then((r) => r.json()),
          fetch("/api/admin/marketing/coupons").then((r) => r.json()),
        ]);
        setFeatured(f.items ?? []);
        setBanners(b.items ?? []);
        setCoupons(c.items ?? []);
      } catch {
        setErr("Falha ao carregar marketing.");
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(ok: string) {
    setErr("");
    setMsg(ok);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="min-h-6 text-sm">
        {err ? <p className="text-red-300">{err}</p> : null}
        {msg ? <p className="text-emerald-300">{msg}</p> : null}
      </div>

      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Destaques na home</h2>
        <p className="mt-1 text-sm text-white/55">Ordem define prioridade no carrossel. Slug deve existir na vitrine.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="slug do produto"
            className="focus-ring rounded-full border border-white/12 bg-black/30 px-4 py-2 text-sm text-white"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              start(async () => {
                try {
                  const res = await fetch("/api/admin/marketing/featured", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productSlug: newSlug, sortOrder: featured.length }),
                  });
                  const data = (await res.json()) as { message?: string };
                  if (!res.ok) {
                    throw new Error(data.message ?? "Erro");
                  }
                  setNewSlug("");
                  flash("Destaque adicionado.");
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Erro");
                }
              });
            }}
            className="rounded-full bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-white"
          >
            Adicionar
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {featured.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-white/80"
            >
              <span>
                {f.productSlug} · ordem {f.sortOrder} · {f.active ? "ativo" : "inativo"}
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-red-300"
                onClick={() => {
                  start(async () => {
                    await fetch(`/api/admin/marketing/featured/${f.id}`, { method: "DELETE" });
                    flash("Removido.");
                  });
                }}
              >
                remover
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Banners</h2>
        <p className="mt-1 text-sm text-white/55">URL de imagem (pode ser /caminho em public ou CDN).</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Título"
            value={newBanner.title}
            onChange={(e) => setNewBanner((b) => ({ ...b, title: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="URL da imagem"
            value={newBanner.imageUrl}
            onChange={(e) => setNewBanner((b) => ({ ...b, imageUrl: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="Link (opcional)"
            value={newBanner.href}
            onChange={(e) => setNewBanner((b) => ({ ...b, href: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="Ordem"
            value={newBanner.sortOrder}
            onChange={(e) => setNewBanner((b) => ({ ...b, sortOrder: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await fetch("/api/admin/marketing/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: newBanner.title || null,
                  imageUrl: newBanner.imageUrl,
                  href: newBanner.href || null,
                  sortOrder: Number(newBanner.sortOrder) || 0,
                }),
              });
              if (!res.ok) {
                setErr("Falha ao criar banner.");
                return;
              }
              setNewBanner({ title: "", imageUrl: "", href: "", sortOrder: "0" });
              flash("Banner criado.");
            });
          }}
          className="mt-3 rounded-full bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-white"
        >
          Criar banner
        </button>
        <ul className="mt-4 space-y-2 text-sm text-white/75">
          {banners.map((b) => (
            <li key={b.id} className="flex justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
              <span>
                {b.title ?? "—"} · {b.imageUrl.slice(0, 48)}…
              </span>
              <button
                type="button"
                className="text-xs text-red-300"
                onClick={() => {
                  start(async () => {
                    await fetch(`/api/admin/marketing/banners/${b.id}`, { method: "DELETE" });
                    flash("Banner removido.");
                  });
                }}
              >
                excluir
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Cupons</h2>
        <p className="mt-1 text-sm text-white/55">Cadastro persistido; aplicação no checkout pode ser evoluída depois.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            placeholder="Código"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon((c) => ({ ...c, code: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <select
            value={newCoupon.discountType}
            onChange={(e) => setNewCoupon((c) => ({ ...c, discountType: e.target.value as "percent" | "fixed" }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="percent">Percentual</option>
            <option value="fixed">Valor fixo (R$)</option>
          </select>
          <input
            placeholder="Valor"
            value={newCoupon.discountValue}
            onChange={(e) => setNewCoupon((c) => ({ ...c, discountValue: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <input
            placeholder="Máx. usos (vazio = ilimitado)"
            value={newCoupon.maxUses}
            onChange={(e) => setNewCoupon((c) => ({ ...c, maxUses: e.target.value }))}
            className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await fetch("/api/admin/marketing/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: newCoupon.code,
                  discountType: newCoupon.discountType,
                  discountValue: Number(newCoupon.discountValue),
                  maxUses: newCoupon.maxUses ? Number(newCoupon.maxUses) : null,
                }),
              });
              if (!res.ok) {
                setErr("Falha ao criar cupom.");
                return;
              }
              setNewCoupon({ code: "", discountType: "percent", discountValue: "", maxUses: "" });
              flash("Cupom criado.");
            });
          }}
          className="mt-3 rounded-full bg-fuchsia-500/90 px-4 py-2 text-sm font-semibold text-white"
        >
          Criar cupom
        </button>
        <ul className="mt-4 space-y-2 text-sm">
          {coupons.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-white/80"
            >
              <span>
                {c.code} · {c.discountType} {c.discountValue} · {c.active ? "ativo" : "inativo"}
              </span>
              <button
                type="button"
                className="text-xs text-red-300"
                onClick={() => {
                  start(async () => {
                    await fetch(`/api/admin/marketing/coupons/${c.id}`, { method: "DELETE" });
                    flash("Cupom removido.");
                  });
                }}
              >
                excluir
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
