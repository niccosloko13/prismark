import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatusPill } from "@/components/common/status-pill";
import { requireAdminSession } from "@/lib/admin";
import { getOrders, getPaymentSettings, getPendingPixPayments } from "@/lib/storage";
import { formatCurrencyBRL } from "@/lib/utils";

export default async function AdminPage() {
  await requireAdminSession();

  const orders = await getOrders();
  const [paymentSettings, pendingPixPayments] = await Promise.all([getPaymentSettings(), getPendingPixPayments()]);
  const awaitingPayment = orders.filter((order) => order.status === "aguardando pagamento").length;
  const confirmed = orders.filter((order) => order.status === "confirmado").length;
  const cancelled = orders.filter((order) => order.status === "cancelado").length;
  const confirmedRevenue = orders.filter((order) => order.status === "confirmado").reduce((sum, o) => sum + o.value, 0);

  return (
    <AdminShell title="Dashboard" subtitle="Visão operacional de pedidos e pagamentos Pix da Prismarq.">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Total de pedidos", value: String(orders.length) },
          { label: "Aguardando pagamento", value: String(awaitingPayment) },
          { label: "Pagamentos Pix pendentes", value: String(pendingPixPayments.length) },
          { label: "Pedidos confirmados", value: String(confirmed) },
          { label: "Receita confirmada", value: formatCurrencyBRL(confirmedRevenue) },
          { label: "Pedidos cancelados", value: String(cancelled) },
        ].map((item) => (
          <article key={item.label} className="panel p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-black/46">{item.label}</p>
            <strong className="mt-2 block text-2xl font-semibold text-ink">{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="panel p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Últimos pedidos</h3>
            <Link href="/admin/orders" className="text-sm font-semibold text-cyan-700">
              Ver todos
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="rounded-[14px] border border-black/10 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">#{order.id}</p>
                  <StatusPill status={order.status} />
                </div>
                <p className="mt-1 text-xs text-black/58">
                  {order.clientName} · {order.productName}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Últimos pagamentos Pix</h3>
            <Link href="/admin/payments" className="text-sm font-semibold text-cyan-700">
              Ver pendentes
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {pendingPixPayments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="rounded-[14px] border border-black/10 bg-white p-3">
                <p className="text-sm font-semibold text-ink">Pedido #{payment.order.id}</p>
                <p className="mt-1 text-xs text-black/58">
                  {payment.order.clientName} · txid {payment.txid}
                </p>
              </div>
            ))}
            {pendingPixPayments.length === 0 ? <p className="text-sm text-black/58">Sem pagamentos pendentes.</p> : null}
          </div>
        </article>
      </section>

      <section className="panel p-4">
        <h3 className="text-lg font-semibold text-ink">Alertas importantes</h3>
        <div className="mt-3 grid gap-2">
          {!paymentSettings?.pixEnabled || !paymentSettings.pixKey ? (
            <p className="rounded-[14px] border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Pix não configurado.
            </p>
          ) : null}
          {pendingPixPayments.length > 0 ? (
            <p className="rounded-[14px] border border-cyan/20 bg-cyan/10 px-3 py-2 text-sm text-ink">
              Existem pagamentos pendentes aguardando conferência.
            </p>
          ) : null}
          {awaitingPayment > 0 ? (
            <p className="rounded-[14px] border border-black/10 bg-black/[0.03] px-3 py-2 text-sm text-black/72">
              Existem pedidos sem pagamento confirmado.
            </p>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
