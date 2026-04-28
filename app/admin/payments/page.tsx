import { AdminPaymentsBoard } from "@/components/admin/admin-payments-board";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { getPendingPixPayments } from "@/lib/storage";

export default async function AdminPaymentsPage() {
  await requireAdminSession();
  const pendingPayments = await getPendingPixPayments();

  return (
    <AdminShell title="Pagamentos Pix" subtitle="Conferência e atualização de pagamentos pendentes.">
      <AdminPaymentsBoard initialPayments={pendingPayments} />
    </AdminShell>
  );
}
