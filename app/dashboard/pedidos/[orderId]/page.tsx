import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusPill } from "@/components/common/status-pill";
import { getSession } from "@/lib/auth";
import { CLIENT_ORDER_STATUS_LABELS } from "@/lib/client-order-status";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { ordersService } from "@/server/services/orders.service";

export default async function DashboardPedidoDetalhePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getSession();

  if (!session) {
    const { orderId } = await params;
    redirect(`/login?returnTo=${encodeURIComponent(`/dashboard/pedidos/${orderId}`)}`);
  }

  const { orderId } = await params;
  const order = await ordersService.findOneForSession(orderId, session);

  return (
    <div className="space-y-6">
      <div className="panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-kicker">Pedido</p>
            <h1 className="display-title mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              #{order.id}
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Criado em {formatDateBR(order.createdAt)} · {order.productName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusPill status={order.status} tone="dark" label={CLIENT_ORDER_STATUS_LABELS[order.status]} />
            <strong className="text-2xl font-semibold tabular-nums text-white">{formatCurrencyBRL(order.value)}</strong>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-soft p-4 text-sm">
            <span className="label-kicker block">Medidas</span>
            <strong className="mt-2 block text-white">
              {order.measures.width} × {order.measures.height} cm
            </strong>
          </div>
          <div className="surface-soft p-4 text-sm">
            <span className="label-kicker block">Quantidade</span>
            <strong className="mt-2 block text-white">{order.measures.quantity} un.</strong>
          </div>
          <div className="surface-soft p-4 text-sm">
            <span className="label-kicker block">Material</span>
            <strong className="mt-2 block text-white">{order.material}</strong>
          </div>
          <div className="surface-soft p-4 text-sm">
            <span className="label-kicker block">Prazo</span>
            <strong className="mt-2 block text-white">{order.deadline}</strong>
          </div>
        </div>

        {order.notes ? (
          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75">
            {order.notes}
          </div>
        ) : null}

        {order.statusHistory?.[0] ? (
          <p className="mt-4 text-sm text-white/55">
            Última movimentação: {order.statusHistory[0].changedByName ?? "Sistema"} em{" "}
            {formatDateBR(order.statusHistory[0].createdAt)}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {order.status === "aguardando pagamento" ? (
            <Link href={`/dashboard/pedidos/${order.id}/pagamento`} className="btn btn-primary focus-ring px-5 py-2.5">
              Pagar com Pix
            </Link>
          ) : null}
          <Link href="/dashboard" className="btn btn-secondary focus-ring px-5 py-2.5">
            Voltar aos pedidos
          </Link>
          {order.file ? (
            <a href={order.file.url} className="btn btn-secondary focus-ring px-5 py-2.5">
              Arquivo enviado
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
