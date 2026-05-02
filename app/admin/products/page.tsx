import { AdminProductsPanel } from "@/components/admin/admin-products-panel";
import { AdminStoreProductsPanel } from "@/components/admin/admin-store-products-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { products } from "@/lib/catalog";
import { getOrders } from "@/lib/storage";
import { productOverridesRepository } from "@/server/repositories/product-overrides.repository";
import { storeProductsRepository } from "@/server/repositories/store-products.repository";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const [orders, overrides, storeProducts] = await Promise.all([
    getOrders(),
    productOverridesRepository.listAll().catch(() => []),
    storeProductsRepository.listAllNonDeleted().catch(() => []),
  ]);

  const orderCountBySlug = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.productSlug] = (acc[o.productSlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell
      title="Produtos"
      subtitle="Catálogo estático (pastas em /public/product), produtos cadastrados no admin e overrides de vitrine."
    >
      <div className="space-y-8">
        <AdminStoreProductsPanel initialProducts={storeProducts} />
        <AdminProductsPanel catalog={products} orderCountBySlug={orderCountBySlug} initialOverrides={overrides} />
      </div>
    </AdminShell>
  );
}
