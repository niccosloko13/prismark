import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { getOrders } from "@/lib/storage";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

export default async function AdminCustomersPage() {
  await requireAdminSession();
  const orders = await getOrders();

  const customers = Object.values(
    orders.reduce<Record<string, { name: string; email: string; phone: string | null; orders: number; total: number; lastOrder: string }>>(
      (acc, order) => {
        const key = order.clientEmail;
        const current = acc[key] ?? {
          name: order.clientName,
          email: order.clientEmail,
          phone: order.clientPhone ?? null,
          orders: 0,
          total: 0,
          lastOrder: order.createdAt,
        };
        current.orders += 1;
        current.total += order.value;
        if (new Date(order.createdAt).getTime() > new Date(current.lastOrder).getTime()) {
          current.lastOrder = order.createdAt;
        }
        acc[key] = current;
        return acc;
      },
      {},
    ),
  );

  return (
    <AdminShell title="Clientes" subtitle="Base de clientes consolidada a partir dos pedidos.">
      <section className="grid gap-3">
        {customers.map((customer) => (
          <article key={customer.email} className="panel p-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <p>
                <strong>Nome:</strong> {customer.name}
              </p>
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
              <p>
                <strong>Telefone:</strong> {customer.phone ?? "-"}
              </p>
              <p>
                <strong>Total de pedidos:</strong> {customer.orders}
              </p>
              <p>
                <strong>Ultimo pedido:</strong> {formatDateBR(customer.lastOrder)}
              </p>
              <p>
                <strong>Total gasto:</strong> {formatCurrencyBRL(customer.total)}
              </p>
            </div>
          </article>
        ))}
        {customers.length === 0 ? <p className="panel p-4 text-sm text-black/58">Nenhum cliente encontrado.</p> : null}
      </section>
    </AdminShell>
  );
}
