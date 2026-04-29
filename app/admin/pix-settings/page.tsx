import { AdminPixEmvDevPanel } from "@/components/admin/admin-pix-emv-dev-panel";
import { AdminPixSettingsForm } from "@/components/admin/admin-pix-settings-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { getPaymentSettings } from "@/lib/storage";

export default async function AdminPixSettingsPage() {
  await requireAdminSession();
  const settings = await getPaymentSettings();
  const showPixDevTools = process.env.NODE_ENV === "development";

  return (
    <AdminShell title="Configuracao Pix" subtitle="Defina chave Pix e dados de recebedor para o checkout.">
      <AdminPixSettingsForm initialSettings={settings} />
      {showPixDevTools ? <AdminPixEmvDevPanel /> : null}
    </AdminShell>
  );
}
