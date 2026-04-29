import { AdminCustomersBoard } from "@/components/admin/admin-customers-board";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { getOrders, getUsers } from "@/lib/storage";

export default async function AdminCustomersPage() {
  await requireAdminSession();
  const [users, orders] = await Promise.all([getUsers(), getOrders()]);
  const clients = users
    .filter((u) => u.role === "client")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      company: u.company,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

  return (
    <AdminShell
      title="Clientes"
      subtitle="Usuários cadastrados, busca e status ativo/inativo. Histórico consolidado por cliente."
    >
      <AdminCustomersBoard clients={clients} orders={orders} />
    </AdminShell>
  );
}
