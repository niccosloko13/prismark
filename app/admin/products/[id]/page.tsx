import { notFound } from "next/navigation";

import { StoreProductEditor } from "@/components/admin/store-product-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { storeProductsRepository } from "@/server/repositories/store-products.repository";

export default async function AdminEditStoreProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  const row = await storeProductsRepository.getById(id);
  if (!row) {
    notFound();
  }

  return (
    <AdminShell title="Editar produto" subtitle={`${row.payload.product.name} · ${row.slug}`}>
      <StoreProductEditor mode="edit" initialRow={row} />
    </AdminShell>
  );
}
