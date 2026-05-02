import { StoreProductEditor } from "@/components/admin/store-product-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminNewStoreProductPage() {
  await requireAdminSession();

  return (
    <AdminShell
      title="Novo produto"
      subtitle="Cadastro completo para a vitrine. Slug único; não use slugs do catálogo estático."
    >
      <StoreProductEditor mode="create" initialRow={null} />
    </AdminShell>
  );
}
