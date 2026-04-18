import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/layout/brand-logo";
import { AdminOrdersBoard } from "@/components/admin/admin-orders-board";
import { getSession } from "@/lib/auth";
import { getOrders } from "@/lib/storage";
import { formatCurrencyBRL } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login?returnTo=/admin");
  }

  const orders = await getOrders();
  const totalRevenue = orders.reduce((sum, order) => sum + order.value, 0);
  const waitingArtwork = orders.filter((order) => order.status === "aguardando arte").length;
  const inProduction = orders.filter((order) => order.status === "produção").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6 sm:p-8 lg:p-10">
          <BrandLogo size="sm" priority className="focus-ring rounded-full" />
          <p className="label-kicker mt-5">Painel admin</p>
          <h1 className="display-title mt-3 text-[clamp(2.5rem,4vw,4.25rem)] font-semibold leading-[0.95] tracking-tight">
            Operação Prismarq
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/68">
            Visualize todos os pedidos, filtre por status, revise detalhes e mova o fluxo operacional direto da
            interface.
          </p>
        </div>
        <div className="panel-dark p-6 sm:p-8 lg:p-10">
          <p className="label-kicker text-white/58">Resumo operacional</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/46">Pedidos</p>
              <strong className="mt-2 block text-3xl font-semibold">{orders.length}</strong>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/46">Aguardando arte</p>
              <strong className="mt-2 block text-3xl font-semibold">{waitingArtwork}</strong>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/46">Produção</p>
              <strong className="mt-2 block text-3xl font-semibold">{inProduction}</strong>
            </div>
          </div>
          <div className="mt-4 rounded-[28px] border border-white/10 bg-white/6 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/46">Receita total</p>
            <strong className="mt-2 block text-3xl font-semibold">{formatCurrencyBRL(totalRevenue)}</strong>
          </div>
        </div>
      </section>

      <AdminOrdersBoard orders={orders} />
    </div>
  );
}
