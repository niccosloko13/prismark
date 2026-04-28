import { AdminOrdersBoard } from "@/components/admin/admin-orders-board";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { getOrders } from "@/lib/storage";

export default async function AdminOrdersPage() {
  await requireAdminSession();
  const orders = await getOrders();

  return (
    <AdminShell title="Pedidos" subtitle="Gestão completa de pedidos com filtros, busca e atualização de status.">
      <AdminOrdersBoard orders={orders} />
    </AdminShell>
  );
}
