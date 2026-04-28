"use client";

import { useState, useTransition } from "react";

import { StatusPill } from "@/components/common/status-pill";
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: drafts[orderId],
          }),
        });

        const data = (await response.json()) as {
          message?: string;
          order?: OrderRecord;
        };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pedido, cliente, e-mail ou telefone"
          className="field min-w-[18rem] max-w-full"
        />
        <button
          type="button"
          onClick={() => setStatusFilter("todos")}
          data-active={statusFilter === "todos"}
          className="btn-chip focus-ring"
        >
          todos
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            data-active={statusFilter === status}
            className="btn-chip focus-ring"
          >
            {status}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {error ? <p className="font-medium text-red-600">{error}</p> : null}
        {!error && message ? <p className="font-medium text-emerald-700">{message}</p> : null}
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <article key={order.id} className="panel p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="display-title text-2xl font-semibold tracking-tight">{order.id}</h3>
                  <StatusPill status={order.status} />
                </div>
                <p className="mt-2 text-sm text-black/62">
                  {order.clientName} · {order.clientEmail}
                </p>
                <p className="mt-1 text-sm text-black/52">
                  Criado em {formatDateBR(order.createdAt)} · Atualizado em {formatDateBR(order.updatedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black/58">{order.productName}</p>
                <strong className="text-2xl font-semibold text-ink">{formatCurrencyBRL(order.value)}</strong>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="surface-soft p-4 text-sm">
                <span className="label-kicker block">medidas</span>
                <strong className="mt-2 block text-base text-ink">
                  {order.measures.width} x {order.measures.height} cm
                </strong>
              </div>
              <div className="surface-soft p-4 text-sm">
                <span className="label-kicker block">quantidade</span>
                <strong className="mt-2 block text-base text-ink">{order.measures.quantity} un.</strong>
              </div>
              <div className="surface-soft p-4 text-sm">
                <span className="label-kicker block">material</span>
                <strong className="mt-2 block text-base text-ink">{order.material}</strong>
              </div>
              <div className="surface-soft p-4 text-sm">
                <span className="label-kicker block">acabamento</span>
                <strong className="mt-2 block text-base text-ink">{order.finishing}</strong>
              </div>
              <div className="surface-soft p-4 text-sm">
                <span className="label-kicker block">prazo</span>
                <strong className="mt-2 block text-base text-ink">{order.deadline}</strong>
              </div>
            </div>

            {order.notes ? <p className="mt-4 text-sm leading-6 text-black/66">{order.notes}</p> : null}

            {order.statusHistory?.length ? (
              <div className="mt-5 rounded-[28px] border border-black/10 bg-black/[0.025] p-4">
                <p className="label-kicker">Histórico de status</p>
                <div className="mt-4 grid gap-3">
                  {order.statusHistory.slice(0, 4).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-2 rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-ink">
                          {entry.fromStatus ? `${entry.fromStatus} -> ${entry.toStatus}` : `início -> ${entry.toStatus}`}
                        </p>
                        <p className="mt-1 text-black/58">
                          {entry.changedByName ?? "Sistema"} · {formatDateBR(entry.createdAt)}
                        </p>
                      </div>
                      {entry.note ? <p className="text-black/58">{entry.note}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={drafts[order.id] ?? order.status}
                  onChange={(event) =>
                    setDrafts((previous) => ({
                      ...previous,
                      [order.id]: event.target.value as OrderStatus,
                    }))
                  }
                  className="field rounded-full px-4 py-3"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => updateStatus(order.id)}
                  className="btn btn-primary focus-ring px-5 py-3"
                >
                  Atualizar status
                </button>
              </div>
              {order.file ? (
                <a href={order.file.url} className="btn btn-secondary focus-ring px-4 py-3">
                  Acessar arquivo
                </a>
              ) : (
                <span className="text-sm font-medium text-black/52">Sem arquivo anexado</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
