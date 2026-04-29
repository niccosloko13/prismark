import { AdminProductsPanel } from "@/components/admin/admin-products-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { products } from "@/lib/catalog";
import { getOrders } from "@/lib/storage";
import { productOverridesRepository } from "@/server/repositories/product-overrides.repository";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const [orders, overrides] = await Promise.all([
    getOrders(),
    productOverridesRepository.listAll().catch(() => []),
  ]);

  const orderCountBySlug = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.productSlug] = (acc[o.productSlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell
      title="Produtos"
      subtitle="Listagem do catálogo base, pedidos por SKU, ativar/desativar na vitrine e ajuste de preço por m²."
    >
      <AdminProductsPanel catalog={products} orderCountBySlug={orderCountBySlug} initialOverrides={overrides} />
    </AdminShell>
  );
}
