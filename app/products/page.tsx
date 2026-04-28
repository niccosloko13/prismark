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
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="-mx-0.5 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {!query
              ? commercialCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/products?q=${encodeURIComponent(category)}`}
                    className="btn-chip focus-ring shrink-0 whitespace-nowrap"
                  >
                    {category}
                  </Link>
                ))
              : null}
          </div>

          <div className="surface-muted shrink-0 self-stretch px-4 py-3 text-center text-sm font-medium text-black/62 sm:self-auto sm:text-left">
            {filteredProducts.length} produto(s) disponivel(is)
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} variant="catalog" />
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
