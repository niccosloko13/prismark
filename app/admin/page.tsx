import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { getAdminDashboardMetrics } from "@/lib/admin-metrics";
import { formatCurrencyBRL } from "@/lib/utils";

export default async function AdminPage() {
  await requireAdminSession();
  const m = await getAdminDashboardMetrics();

  const tiles = [
    { label: "Faturamento (pipeline pago)", value: formatCurrencyBRL(m.revenueTotal) },
    { label: "Faturamento hoje", value: formatCurrencyBRL(m.revenueToday) },
    { label: "Faturamento no mês", value: formatCurrencyBRL(m.revenueMonth) },
    { label: "Pedidos hoje", value: String(m.ordersToday) },
    { label: "Pedidos no mês", value: String(m.ordersMonth) },
    { label: "Pix pendentes", value: String(m.pixPending) },
    { label: "Em produção / análise", value: String(m.ordersInProduction) },
    { label: "Clientes cadastrados", value: String(m.clientsRegistered) },
    { label: "Produtos ativos (vitrine)", value: String(m.productsActive) },
    { label: "Produtos no catálogo base", value: String(m.productsCatalog) },
    { label: "Total de pedidos", value: String(m.ordersTotal) },
  ];

  return (
    <AdminShell
      title="Dashboard geral"
      subtitle="Métricas em tempo real a partir do PostgreSQL: pedidos, Pix e base de clientes."
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((item) => (
          <article
            key={item.label}
            className="rounded-[22px] border border-white/10 bg-[#0d1019]/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/45">{item.label}</p>
            <strong className="mt-2 block text-2xl font-semibold tabular-nums text-white">{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[22px] border border-white/10 bg-[#0d1019]/90 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Produtos mais vendidos</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/72">
            {m.topProducts.length === 0 ? (
              <li className="text-white/50">Ainda não há histórico suficiente.</li>
            ) : (
              m.topProducts.map((row) => (
                <li
                  key={row.slug}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2"
                >
                  <span className="font-medium text-white">{row.name}</span>
                  <span className="tabular-nums text-cyan-200">{row.count} ped.</span>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-[#0d1019]/90 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Atalhos</h3>
          <div className="mt-4 grid gap-2 text-sm font-semibold">
            <Link href="/admin/orders" className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-cyan-200 hover:bg-white/[0.08]">
              Ver todos os pedidos →
            </Link>
            <Link href="/admin/payments" className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-cyan-200 hover:bg-white/[0.08]">
              Conferir Pix pendentes →
            </Link>
            <Link href="/admin/marketing" className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-cyan-200 hover:bg-white/[0.08]">
              Destaques e cupons →
            </Link>
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
