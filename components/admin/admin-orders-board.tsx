"use client";

import { useState, useTransition } from "react";

import { StatusPill } from "@/components/common/status-pill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { ORDER_STATUSES, type OrderRecord, type OrderStatus } from "@/types";

const statuses: OrderStatus[] = [...ORDER_STATUSES];

export function AdminOrdersBoard({ orders }: { orders: OrderRecord[] }) {
  const [list, setList] = useState(orders);
  const [statusFilter, setStatusFilter] = useState<"todos" | OrderStatus>("todos");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, OrderStatus>>(
    Object.fromEntries(orders.map((order) => [order.id, order.status])),
  );
  const [adminNotesDraft, setAdminNotesDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(orders.map((o) => [o.id, o.adminNotes ?? ""])),
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOrders = list.filter((order) => {
    const byStatus = statusFilter === "todos" || order.status === statusFilter;
    const haystack = `${order.id} ${order.clientName} ${order.clientEmail} ${order.clientPhone ?? ""}`.toLowerCase();
    const bySearch = search.trim().length === 0 || haystack.includes(search.trim().toLowerCase());
    return byStatus && bySearch;
  });

  function updateStatus(orderId: string) {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: drafts[orderId] }),
        });

        const data = (await response.json()) as { message?: string; order?: OrderRecord };

        if (!response.ok || !data.order) {
          throw new Error(data.message ?? "Falha ao atualizar o pedido.");
        }

        setList((previous) => previous.map((order) => (order.id === orderId ? data.order! : order)));
        setMessage(`Status do pedido ${orderId} atualizado.`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  function saveAdminNotes(orderId: string) {
    setError("");
    setMessage("");
    const text = adminNotesDraft[orderId] ?? "";

    startTransition(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminNotes: text.trim() || null }),
        });
        const data = (await response.json()) as { message?: string; order?: OrderRecord };
        if (!response.ok || !data.order) {
          throw new Error(data.message ?? "Falha ao salvar observações.");
        }
        setList((previous) => previous.map((order) => (order.id === orderId ? data.order! : order)));
        setMessage(`Observações internas do pedido ${orderId} salvas.`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pedido, cliente, e-mail ou telefone"
          className="focus-ring min-w-[18rem] max-w-full rounded-full border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/40"
        />
        <button
          type="button"
          onClick={() => setStatusFilter("todos")}
          data-active={statusFilter === "todos"}
          className="btn-chip focus-ring border-white/10 !bg-white/[0.06] !text-white data-[active=true]:!bg-gradient-to-r data-[active=true]:from-cyan-500/30 data-[active=true]:to-fuchsia-500/25"
        >
          todos
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            data-active={statusFilter === status}
            className="btn-chip focus-ring border-white/10 !bg-white/[0.06] !text-white data-[active=true]:!bg-gradient-to-r data-[active=true]:from-cyan-500/30 data-[active=true]:to-fuchsia-500/25"
          >
            {status}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {error ? <p className="font-medium text-red-300">{error}</p> : null}
        {!error && message ? <p className="font-medium text-emerald-300">{message}</p> : null}
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-[24px] border border-white/10 bg-[#0d1019]/92 p-6 shadow-[0_20px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{order.id}</h3>
                  <StatusPill status={order.status} />
                </div>
                <p className="mt-2 text-sm text-white/65">
                  {order.clientName} · {order.clientEmail}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Criado em {formatDateBR(order.createdAt)} · Atualizado em {formatDateBR(order.updatedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/55">{order.productName}</p>
                <strong className="text-2xl font-semibold tabular-nums text-white">{formatCurrencyBRL(order.value)}</strong>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {[
                { k: "medidas", v: `${order.measures.width} x ${order.measures.height} cm` },
                { k: "quantidade", v: `${order.measures.quantity} un.` },
                { k: "material", v: order.material },
                { k: "acabamento", v: order.finishing },
                { k: "prazo", v: order.deadline },
              ].map((cell) => (
                <div key={cell.k} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {cell.k}
                  </span>
                  <strong className="mt-2 block text-base text-white">{cell.v}</strong>
                </div>
              ))}
            </div>

            {order.notes ? (
              <p className="mt-4 text-sm leading-6 text-white/65">
                <span className="font-semibold text-white/80">Notas do cliente: </span>
                {order.notes}
              </p>
            ) : null}

            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                Observações internas (admin)
              </p>
              <textarea
                value={adminNotesDraft[order.id] ?? ""}
                onChange={(e) =>
                  setAdminNotesDraft((prev) => ({
                    ...prev,
                    [order.id]: e.target.value,
                  }))
                }
                rows={3}
                className="focus-ring mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35"
                placeholder="Uso interno: produção, cobrança, follow-up..."
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => saveAdminNotes(order.id)}
                className="focus-ring mt-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.12]"
              >
                Salvar observações internas
              </button>
            </div>

            {order.statusHistory?.length ? (
              <div className="mt-5 rounded-[28px] border border-white/8 bg-black/20 p-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Histórico de status
                </p>
                <div className="mt-4 grid gap-3">
                  {order.statusHistory.slice(0, 4).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-2 rounded-3xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {entry.fromStatus ? `${entry.fromStatus} → ${entry.toStatus}` : `início → ${entry.toStatus}`}
                        </p>
                        <p className="mt-1 text-white/50">
                          {entry.changedByName ?? "Sistema"} · {formatDateBR(entry.createdAt)}
                        </p>
                      </div>
                      {entry.note ? <p className="text-white/55">{entry.note}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={drafts[order.id] ?? order.status}
                  onValueChange={(next) =>
                    setDrafts((previous) => ({
                      ...previous,
                      [order.id]: next as OrderStatus,
                    }))
                  }
                >
                  <SelectTrigger className="min-w-[14rem] rounded-full border-white/12 bg-white/[0.06] px-4 py-3 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => updateStatus(order.id)}
                  className="focus-ring rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(56,189,248,0.25)]"
                >
                  Atualizar status
                </button>
              </div>
              {order.file ? (
                <a
                  href={order.file.url}
                  className="focus-ring inline-flex rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.1]"
                >
                  Acessar arquivo
                </a>
              ) : (
                <span className="text-sm font-medium text-white/45">Sem arquivo anexado</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
