import { AdminMarketingPanel } from "@/components/admin/admin-marketing-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminMarketingPage() {
  await requireAdminSession();

  return (
    <AdminShell
      title="Marketing"
      subtitle="Produtos em destaque na home, banners promocionais e cupons (persistência PostgreSQL)."
    >
      <AdminMarketingPanel />
    </AdminShell>
  );
}
