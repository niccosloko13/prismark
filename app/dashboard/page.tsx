import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/layout/brand-logo";
import { ClientOrdersPanel } from "@/components/dashboard/client-orders-panel";
import { getSession } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/storage";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnTo=/dashboard");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  const orders = await getOrdersByUser(session.id);
  const activeOrders = orders.filter((order) => !["finalizado", "entregue"].includes(order.status)).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6 sm:p-8 lg:p-10">
          <BrandLogo size="sm" priority className="focus-ring rounded-full" />
          <p className="label-kicker mt-5">Painel do cliente</p>
          <h1 className="display-title mt-3 text-[clamp(2.5rem,4vw,4.25rem)] font-semibold leading-[0.95] tracking-tight">
            {session.name}
          </h1>
          <p className="mt-3 text-base text-black/68">
            {session.company} · {session.email}
          </p>
        </div>
        <div className="panel-dark p-6 sm:p-8 lg:p-10">
          <p className="label-kicker text-white/58">Resumo</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/46">Pedidos</p>
              <strong className="mt-2 block text-3xl font-semibold">{orders.length}</strong>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/46">Em andamento</p>
              <strong className="mt-2 block text-3xl font-semibold">{activeOrders}</strong>
            </div>
          </div>
        </div>
      </section>

      <ClientOrdersPanel orders={orders} />
    </div>
  );
}
