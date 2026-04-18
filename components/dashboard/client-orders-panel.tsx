"use client";

import { useState } from "react";

import { StatusPill } from "@/components/common/status-pill";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { ORDER_STATUSES, type OrderRecord, type OrderStatus } from "@/types";

const filterLabels: Array<"todos" | OrderStatus> = ["todos", ...ORDER_STATUSES];

export function ClientOrdersPanel({ orders }: { orders: OrderRecord[] }) {
  const [statusFilter, setStatusFilter] = useState<(typeof filterLabels)[number]>("todos");

  const filteredOrders =
    statusFilter === "todos" ? orders : orders.filter((order) => order.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filterLabels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(label)}
            data-active={statusFilter === label}
            className="btn-chip focus-ring"
          >
            {label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="panel p-8 text-center text-black/62">
          Nenhum pedido encontrado para o filtro selecionado.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <article key={order.id} className="panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="display-title text-2xl font-semibold tracking-tight">{order.productName}</h3>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="mt-2 text-sm text-black/62">
                    {order.id} · criado em {formatDateBR(order.createdAt)}
                  </p>
                </div>
                <strong className="text-xl font-semibold text-ink">{formatCurrencyBRL(order.value)}</strong>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                  <span className="label-kicker block">prazo</span>
                  <strong className="mt-2 block text-base text-ink">{order.deadline}</strong>
                </div>
              </div>
              {order.notes ? <p className="mt-4 text-sm leading-6 text-black/66">{order.notes}</p> : null}
              {order.statusHistory?.[0] ? (
                <p className="mt-3 text-sm text-black/56">
                  Última movimentação: {order.statusHistory[0].changedByName ?? "Sistema"} em{" "}
                  {formatDateBR(order.statusHistory[0].createdAt)}
                </p>
              ) : null}
              {order.file ? (
                <a href={order.file.url} className="btn btn-secondary focus-ring mt-4 px-4 py-2">
                  Abrir arquivo enviado
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
