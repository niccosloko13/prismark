"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { formatCurrencyBRL } from "@/lib/utils";
import type { StoreProductRow } from "@/lib/store-product-payload";

type FilterKind = "all" | "active" | "inactive" | "featured";

function matchesSearch(row: StoreProductRow, q: string) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const cat = row.payload.product.category.toLowerCase();
  return row.slug.includes(s) || row.payload.product.name.toLowerCase().includes(s) || cat.includes(s);
}

export function AdminStoreProductsPanel({ initialProducts }: { initialProducts: StoreProductRow[] }) {
  const [rows, setRows] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (!matchesSearch(r, query)) return false;
      if (filter === "active") return r.isActive;
      if (filter === "inactive") return !r.isActive;
      if (filter === "featured") return r.featured;
      return true;
    });
  }, [rows, query, filter]);

  function refresh() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = (await res.json()) as { products?: StoreProductRow[]; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Falha ao listar.");
        setRows(data.products ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao atualizar lista.");
      }
    });
  }

  function patchRow(id: string, next: Partial<Pick<StoreProductRow, "isActive" | "featured">>) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        const data = (await res.json()) as { product?: StoreProductRow; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Falha ao atualizar.");
        if (data.product) {
          setRows((prev) => prev.map((r) => (r.id === id ? data.product! : r)));
        }
        setMessage("Status atualizado.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro.");
      }
    });
  }

  function duplicate(id: string) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
        const data = (await res.json()) as { product?: StoreProductRow; message?: string };
        if (!res.ok) throw new Error(data.message ?? "Falha ao duplicar.");
        if (data.product) {
          setRows((prev) => [data.product!, ...prev]);
          setMessage(`Cópia criada: ${data.product.slug} (inativo).`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro.");
      }
    });
  }

  return (
    <section className="space-y-4 rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Produtos da loja (admin)</h2>
          <p className="mt-1 text-sm text-white/55">
            Cadastro completo estilo vitrine. Aparecem no site sem alterar código. Inativos somem da vitrine.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="focus-ring inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(56,189,248,0.25)]"
        >
          Adicionar produto
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1 text-sm text-white/70">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/45">Busca</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, slug ou categoria…"
            className="focus-ring w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-white placeholder:text-white/35"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Todos"],
              ["active", "Ativos"],
              ["inactive", "Inativos"],
              ["featured", "Destaque"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={
                filter === k
                  ? "focus-ring rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                  : "focus-ring rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/70"
              }
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            disabled={isPending}
            onClick={refresh}
            className="focus-ring rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="min-h-6 text-sm">
        {error ? <p className="text-red-300">{error}</p> : null}
        {message ? <p className="text-emerald-300">{message}</p> : null}
      </div>

      {/* Mobile: cards */}
      <div className="grid gap-3 lg:hidden">
        {filtered.map((r) => (
          <article key={r.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{r.payload.product.name}</p>
                <p className="truncate text-xs text-white/50">
                  {r.slug} · {r.payload.product.category}
                </p>
              </div>
              <span
                className={
                  r.isActive
                    ? "shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                    : "shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/45"
                }
              >
                {r.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="mt-2 text-sm text-cyan-200/90">{formatCurrencyBRL(r.payload.product.basePriceM2)}/m²</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/admin/products/${r.id}`}
                className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Editar
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => duplicate(r.id)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/85"
              >
                Duplicar
              </button>
              {r.isActive ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => patchRow(r.id, { isActive: false })}
                  className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100"
                >
                  Desativar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => patchRow(r.id, { isActive: true })}
                  className="rounded-full border border-emerald-400/25 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                >
                  Ativar
                </button>
              )}
            </div>
          </article>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-white/45">Nenhum produto neste filtro.</p> : null}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-white/45">
              <th className="border-b border-white/10 py-2 pr-3">Produto</th>
              <th className="border-b border-white/10 px-3 py-2">Slug</th>
              <th className="border-b border-white/10 px-3 py-2">Categoria</th>
              <th className="border-b border-white/10 px-3 py-2">Preço base</th>
              <th className="border-b border-white/10 px-3 py-2">Status</th>
              <th className="border-b border-white/10 py-2 pl-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="text-white/85">
                <td className="border-b border-white/[0.06] py-3 pr-3">
                  <p className="font-medium text-white">{r.payload.product.name}</p>
                  {r.featured ? <span className="text-[10px] font-semibold text-fuchsia-200">Destaque</span> : null}
                </td>
                <td className="border-b border-white/[0.06] px-3 py-3 font-mono text-xs text-cyan-100/90">{r.slug}</td>
                <td className="border-b border-white/[0.06] px-3 py-3 text-white/65">{r.payload.product.category}</td>
                <td className="border-b border-white/[0.06] px-3 py-3">{formatCurrencyBRL(r.payload.product.basePriceM2)}/m²</td>
                <td className="border-b border-white/[0.06] px-3 py-3">
                  <span className={r.isActive ? "text-emerald-200" : "text-white/45"}>{r.isActive ? "Ativo" : "Inativo"}</span>
                </td>
                <td className="border-b border-white/[0.06] py-3 pl-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/products/${r.id}`}
                      className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => duplicate(r.id)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/85"
                    >
                      Duplicar
                    </button>
                    {r.isActive ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => patchRow(r.id, { isActive: false })}
                        className="rounded-full border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-100"
                      >
                        Desativar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => patchRow(r.id, { isActive: true })}
                        className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-100"
                      >
                        Ativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="py-6 text-sm text-white/45">Nenhum produto neste filtro.</p> : null}
      </div>
    </section>
  );
}
