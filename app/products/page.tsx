import Link from "next/link";

import { ProductCard } from "@/components/common/product-card";
import { SectionShell } from "@/components/common/section-shell";
import { products } from "@/lib/catalog";

const commercialCategories = [
  "Grande Formato",
  "Papelaria Promocional",
  "Adesivos e Aplicacao",
  "Sinalizacao e Exposicao",
];

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const normalizedQuery = normalizeForSearch(query);

  const filteredProducts = normalizedQuery
    ? products.filter((product) => {
        const haystack = [
          product.name,
          product.slug,
          product.category,
          product.badge,
          product.description,
          product.lead,
          ...product.applications,
        ].join(" ");

        return normalizeForSearch(haystack).includes(normalizedQuery);
      })
    : products;

  return (
    <div className="space-y-6">
      <SectionShell
        eyebrow="Catalogo"
        title={query ? `Resultados para "${query}"` : "Catalogo pronto para entrar por categoria e fechar mais rapido."}
        description={
          query
            ? `${filteredProducts.length} resultado(s) encontrado(s).`
            : "Grande formato, papelaria, adesivos e sinalizacao organizados em cards mais objetivos para acelerar a escolha."
        }
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {!query
              ? commercialCategories.map((category) => (
                  <Link key={category} href={`/products?q=${encodeURIComponent(category)}`} className="btn-chip focus-ring">
                    {category}
                  </Link>
                ))
              : null}
          </div>

          <div className="surface-muted px-4 py-3 text-sm font-medium text-black/62">
            {filteredProducts.length} produto(s) disponivel(is)
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="panel p-8 text-center">
            <p className="text-lg font-semibold text-ink">Nenhum produto encontrado.</p>
            <p className="mt-2 text-sm leading-6 text-black/64">
              Tente outro termo ou volte ao catalogo completo para navegar por categoria.
            </p>
            <Link href="/products" className="btn btn-primary focus-ring mt-5">
              Ver catalogo completo
            </Link>
          </div>
        )}
      </SectionShell>
    </div>
  );
}
