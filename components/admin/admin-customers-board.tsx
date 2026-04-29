"use client";

import { useMemo, useState, useTransition } from "react";

import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { OrderRecord } from "@/types";

export type AdminClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  isActive: boolean;
  createdAt: string;
};

export function AdminCustomersBoard({
  clients,
  orders,
}: {
  clients: AdminClientRow[];
  orders: OrderRecord[];
}) {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(clients);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const ordersByClient = useMemo(() => {
    const map = new Map<string, OrderRecord[]>();
    for (const o of orders) {
      const list = map.get(o.clientId) ?? [];
      list.push(o);
      map.set(o.clientId, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return map;
  }, [orders]);

  const filtered = rows.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q);
  });

  function setActive(id: string, isActive: boolean) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) {
          throw new Error(data.message ?? "Falha ao atualizar cliente.");
        }
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isActive } : r)));
        setMessage(isActive ? "Cliente reativado." : "Cliente desativado.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, e-mail ou telefone"
        className="focus-ring w-full max-w-md rounded-full border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/40"
      />
      <div className="min-h-6 text-sm">
        {error ? <p className="text-red-300">{error}</p> : null}
        {message ? <p className="text-emerald-300">{message}</p> : null}
      </div>

      <div className="grid gap-4">
        {filtered.map((c) => {
          const history = ordersByClient.get(c.id) ?? [];
          return (
            <article
              key={c.id}
              className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-5 backdrop-blur-xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{c.name}</p>
                  <p className="mt-1 text-sm text-white/65">
                    {c.email} · {c.phone || "—"} · {c.company}
                  </p>
                  <p className="mt-1 text-xs text-white/45">Cadastro: {formatDateBR(c.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={
                      c.isActive
                        ? "rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200"
                        : "rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/55"
                    }
                  >
                    {c.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setActive(c.id, !c.isActive)}
                    className="focus-ring rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.12]"
                  >
                    {c.isActive ? "Desativar conta" : "Reativar conta"}
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-white/8 pt-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Histórico de pedidos ({history.length})
                </p>
                {history.length === 0 ? (
                  <p className="mt-2 text-sm text-white/50">Nenhum pedido ainda.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-white/70">
                    {history.slice(0, 8).map((o) => (
                      <li key={o.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2">
                        <span className="font-medium text-white">{o.id}</span>
                        <span>{formatCurrencyBRL(o.value)}</span>
                        <span className="text-white/50">{formatDateBR(o.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
