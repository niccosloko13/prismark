import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin";
import { products } from "@/lib/catalog";
import { getOrders } from "@/lib/storage";
import { formatCurrencyBRL } from "@/lib/utils";

export default async function AdminProductsPage() {
  await requireAdminSession();
  const orders = await getOrders();

  const bySlug = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.productSlug] = (acc[order.productSlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell title="Produtos" subtitle="Catálogo atual com base de preço e volume de pedidos.">
      <section className="grid gap-3">
        {products.map((product) => (
          <article key={product.slug} className="panel p-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <p>
                <strong>Produto:</strong> {product.name}
              </p>
              <p>
                <strong>Preço base:</strong> {formatCurrencyBRL(product.basePriceM2)}/m²
              </p>
              <p>
                <strong>Status:</strong> {product.featured ? "Ativo (destaque)" : "Ativo"}
              </p>
              <p>
                <strong>Pedidos:</strong> {bySlug[product.slug] ?? 0}
              </p>
            </div>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
