import Link from "next/link";
import type { ReactNode } from "react";

import { ProductRasterPicture } from "@/components/common/product-raster-picture";
import { getProductPrimaryImagePath } from "@/lib/product-images";
import { products } from "@/lib/catalog";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { Product } from "@/types";

type SortKey = "mais-vendidos" | "menor-preco" | "maior-preco" | "nome";
type ViewKey = "grid" | "list";
type FormatKey = "grande" | "medio" | "pequeno";
type MaterialKey = "lona" | "papel" | "vinil";

const CATEGORY_ITEMS = [
  { key: "todos", label: "Todos os produtos" },
  { key: "banners", label: "Banners" },
  { key: "adesivos", label: "Adesivos" },
  { key: "cartao", label: "Cartão de visita" },
  { key: "placas", label: "Placas" },
  { key: "fachadas", label: "Fachadas" },
  { key: "papelaria", label: "Papelaria" },
] as const;

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function getQueryValues(input: string | string[] | undefined): string[] {
  if (!input) return [];
  return (Array.isArray(input) ? input : [input]).map((item) => item.trim()).filter(Boolean);
}

function normalizeFormatParam(value: string): FormatKey | null {
  const normalized = normalizeForSearch(value);
  if (normalized === "grande" || normalized === "grande-formato") return "grande";
  if (normalized === "medio" || normalized === "medio-formato") return "medio";
  if (normalized === "pequeno" || normalized === "pequeno-formato") return "pequeno";
  return null;
}

function normalizeMaterialParam(value: string): MaterialKey | null {
  const normalized = normalizeForSearch(value);
  if (normalized.includes("lona")) return "lona";
  if (normalized.includes("papel")) return "papel";
  if (normalized.includes("vinil")) return "vinil";
  return null;
}

function normalizeSortParam(value: string): SortKey {
  const normalized = normalizeForSearch(value);
  if (normalized === "menor-preco") return "menor-preco";
  if (normalized === "maior-preco") return "maior-preco";
  if (normalized === "nome" || normalized === "nome-a-z") return "nome";
  return "mais-vendidos";
}

function matchesCategory(product: Product, categoryKey: string) {
  const name = normalizeForSearch(product.name);
  const slug = normalizeForSearch(product.slug);
  const category = normalizeForSearch(product.category);

  switch (categoryKey) {
    case "banners":
      return slug.includes("banner") || slug.includes("faixa") || name.includes("banner");
    case "adesivos":
      return slug.includes("adesivo") || category.includes("adesivo");
    case "cartao":
      return slug.includes("cartao") || name.includes("cartao");
    case "placas":
      return slug.includes("placa") || slug.includes("acm") || name.includes("placa");
    case "fachadas":
      return slug.includes("fachada") || slug.includes("lona") || category.includes("sinalizacao");
    case "papelaria":
      return category.includes("papelaria");
    default:
      return true;
  }
}

function matchesFormat(product: Product, format: FormatKey) {
  const category = normalizeForSearch(product.category);
  const name = normalizeForSearch(product.name);

  if (format === "grande") {
    return category.includes("grande formato") || category.includes("sinalizacao") || name.includes("fachada");
  }
  if (format === "medio") {
    return category.includes("adesivos") || category.includes("sinalizacao");
  }
  return category.includes("papelaria") || name.includes("cartao");
}

function matchesMaterial(product: Product, material: MaterialKey) {
  const materials = product.materials.map((item) => normalizeForSearch(item.label));
  if (material === "lona") return materials.some((item) => item.includes("lona"));
  if (material === "papel") return materials.some((item) => item.includes("papel") || item.includes("couche") || item.includes("supremo"));
  return materials.some((item) => item.includes("vinil"));
}

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  if (sort === "menor-preco") {
    return copy.sort((a, b) => a.basePriceM2 - b.basePriceM2);
  }
  if (sort === "maior-preco") {
    return copy.sort((a, b) => b.basePriceM2 - a.basePriceM2);
  }
  if (sort === "nome") {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
}

function buildProdutosHref({
  categoria,
  q,
  sort,
  view,
  formatos,
  materiais,
}: {
  categoria?: string;
  q?: string;
  sort?: SortKey;
  view?: ViewKey;
  formatos?: FormatKey[];
  materiais?: MaterialKey[];
}) {
  const params = new URLSearchParams();
  if (categoria && categoria !== "todos") params.set("categoria", categoria);
  if (q?.trim()) params.set("q", q.trim());
  if (sort && sort !== "mais-vendidos") params.set("sort", sort);
  if (view && view !== "grid") params.set("view", view);
  for (const formato of formatos ?? []) params.append("formato", formato);
  for (const material of materiais ?? []) params.append("material", material);
  const query = params.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-white/85 backdrop-blur-xl">
      {children}
    </span>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M3.75 4.75h1.5l1.2 8.1a2 2 0 0 0 1.98 1.7h7.98a2 2 0 0 0 1.94-1.5l1.4-5.6H7.3" strokeLinecap="round" />
      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ProductListCard({ product }: { product: Product }) {
  const imageSrc = getProductPrimaryImagePath(product.slug);
  const badgeLabel = product.featured ? "MAIS VENDIDO" : "NOVO";
  const pixPrice = product.basePriceM2 * 0.85;
  const installmentText = product.minQuantity > 1 ? `${product.minQuantity}00 un.` : "a partir de";

  return (
    <article className="group relative overflow-hidden rounded-[18px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_14px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:scale-[1.012] hover:border-cyan-400/25 hover:shadow-[0_0_44px_rgba(56,189,248,0.16)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-white">
          {badgeLabel}
        </span>
        <span className="text-xs text-white/35">♡</span>
      </div>

      <Link href={`/products/${product.slug}`} className="focus-ring block">
        <div className="relative aspect-[4/2.8] overflow-hidden rounded-[14px] border border-white/8 bg-[#05070d]">
          {imageSrc ? (
            <ProductRasterPicture
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 260px"
              className="object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/45">Imagem em breve</div>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-1.5">
        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-white/42">{product.category}</p>
        <h3 className="line-clamp-1 text-[1rem] font-semibold leading-tight text-white">{product.name}</h3>
        <p className="line-clamp-1 text-[0.76rem] leading-snug text-white/58">{product.lead}</p>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[1.32rem] font-semibold leading-none text-white">{formatCurrencyBRL(pixPrice)}</p>
          <p className="mt-1 text-[0.68rem] text-white/45">{installmentText}</p>
        </div>
        <Link
          href={`/order?product=${product.slug}`}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white shadow-[0_8px_24px_rgba(168,85,247,0.45)] transition hover:brightness-110"
          aria-label={`Pedir ${product.name}`}
        >
          <CartIcon />
        </Link>
      </div>
    </article>
  );
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    formato?: string | string[];
    material?: string | string[];
    sort?: string;
    ordenar?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const normalizedQuery = normalizeForSearch(query);
  const selectedCategory = CATEGORY_ITEMS.some((item) => item.key === params.categoria) ? params.categoria! : "todos";
  const selectedFormats = Array.from(
    new Set(getQueryValues(params.formato).map(normalizeFormatParam).filter((value): value is FormatKey => value !== null)),
  );
  const selectedMaterials = Array.from(
    new Set(getQueryValues(params.material).map(normalizeMaterialParam).filter((value): value is MaterialKey => value !== null)),
  );
  const sortKey = normalizeSortParam(params.sort ?? params.ordenar ?? "mais-vendidos");
  const view = params.view === "list" ? "list" : "grid";

  const baseFilteredProducts = products.filter((product) => {
    const queryMatches =
      !normalizedQuery ||
      normalizeForSearch(
        [product.name, product.slug, product.category, product.badge, product.description, product.lead, ...product.applications].join(" "),
      ).includes(normalizedQuery);
    const formatMatches = selectedFormats.length === 0 || selectedFormats.some((format) => matchesFormat(product, format));
    const materialMatches = selectedMaterials.length === 0 || selectedMaterials.some((material) => matchesMaterial(product, material));
    return queryMatches && formatMatches && materialMatches;
  });

  const filteredProducts = sortProducts(
    baseFilteredProducts.filter((product) => matchesCategory(product, selectedCategory)),
    sortKey,
  );

  return (
    <div className="min-h-screen bg-[#05070d] text-white space-y-4">
      <section className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4 shadow-[0_20px_54px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] text-white/55">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>{">"}</span>
          <span className="text-white/80">Produtos</span>
        </div>
        <div className="mt-1.5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-[2.05rem] font-semibold leading-none tracking-tight text-white">Produtos</h1>
            <p className="mt-2 max-w-xl text-[0.9rem] text-white/65">Soluções visuais de alta qualidade para destacar sua marca e impulsionar resultados.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Produção própria", text: "Qualidade garantida" },
              { title: "Entrega rápida", text: "Para todo o Brasil" },
              { title: "Atendimento", text: "Especializado" },
              { title: "Ambiente seguro", text: "Seus dados protegidos" },
            ].map((item, index) => (
              <div key={item.title} className="rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2 backdrop-blur-xl">
                <div className="flex items-start gap-2.5">
                  <FeatureIcon>{index + 1}</FeatureIcon>
                  <div>
                    <p className="text-[0.78rem] font-semibold leading-tight text-white/90">{item.title}</p>
                    <p className="mt-0.5 text-[0.68rem] text-white/80">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[262px_minmax(0,1fr)] lg:gap-5">
        <aside className="hidden rounded-[16px] border border-white/8 bg-white/[0.04] p-3 backdrop-blur-xl lg:block">
          <h2 className="text-[1.02rem] font-semibold text-white">Categorias</h2>
          <div className="mt-2.5 space-y-1">
            {CATEGORY_ITEMS.map((item) => {
              const count =
                item.key === "todos"
                  ? baseFilteredProducts.length
                  : baseFilteredProducts.filter((product) => matchesCategory(product, item.key)).length;
              const active = selectedCategory === item.key;
              return (
                <Link
                  key={item.key}
                  href={buildProdutosHref({
                    categoria: item.key,
                    q: query,
                    sort: sortKey,
                    view,
                    formatos: selectedFormats,
                    materiais: selectedMaterials,
                  })}
                  className={cn(
                    "flex items-center justify-between rounded-[10px] px-2.5 py-2 text-[0.84rem] transition",
                    active
                      ? "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white shadow-[0_8px_24px_rgba(168,85,247,0.35)]"
                      : "text-white/75 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <span>{item.label}</span>
                  <span className={cn("text-xs", active ? "text-white/90" : "text-white/45")}>{count}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border-t border-white/8 pt-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-[1.02rem] font-semibold text-white">Filtros</h3>
              <Link href="/produtos" className="text-xs font-semibold text-purple-300 hover:text-purple-200">
                Limpar filtros
              </Link>
            </div>

            <form method="get" action="/produtos" className="space-y-4">
              {selectedCategory !== "todos" ? <input type="hidden" name="categoria" value={selectedCategory} /> : null}
              {query ? <input type="hidden" name="q" value={query} /> : null}
              <input type="hidden" name="sort" value={sortKey} />
              <input type="hidden" name="view" value={view} />
              <div>
                <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/45">Formato</p>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="formato" value="grande" defaultChecked={selectedFormats.includes("grande")} className="accent-purple-400" />Grande formato</label>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="formato" value="medio" defaultChecked={selectedFormats.includes("medio")} className="accent-purple-400" />Médio formato</label>
                <label className="flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="formato" value="pequeno" defaultChecked={selectedFormats.includes("pequeno")} className="accent-purple-400" />Pequeno formato</label>
              </div>
              <div>
                <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/45">Material</p>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="material" value="lona" defaultChecked={selectedMaterials.includes("lona")} className="accent-purple-400" />Lona</label>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="material" value="papel" defaultChecked={selectedMaterials.includes("papel")} className="accent-purple-400" />Papel</label>
                <label className="flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="material" value="vinil" defaultChecked={selectedMaterials.includes("vinil")} className="accent-purple-400" />Vinil</label>
              </div>
              <button type="submit" className="home-btn-gradient focus-ring w-full justify-center">
                Aplicar filtros
              </button>
            </form>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <details className="rounded-[16px] border border-white/8 bg-white/[0.04] p-3 backdrop-blur-xl lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-white">Categorias e filtros</summary>
            <div className="mt-3 space-y-2">
              {CATEGORY_ITEMS.map((item) => {
                const count =
                  item.key === "todos"
                    ? baseFilteredProducts.length
                    : baseFilteredProducts.filter((product) => matchesCategory(product, item.key)).length;
                return (
                  <Link
                    key={item.key}
                    href={buildProdutosHref({
                      categoria: item.key,
                      q: query,
                      sort: sortKey,
                      view,
                      formatos: selectedFormats,
                      materiais: selectedMaterials,
                    })}
                    className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 text-sm text-white/75"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-white/40">{count}</span>
                  </Link>
                );
              })}
            </div>
            <form method="get" action="/produtos" className="mt-3 space-y-3 border-t border-white/8 pt-3">
              {selectedCategory !== "todos" ? <input type="hidden" name="categoria" value={selectedCategory} /> : null}
              {query ? <input type="hidden" name="q" value={query} /> : null}
              <input type="hidden" name="sort" value={sortKey} />
              <input type="hidden" name="view" value={view} />
              <div>
                <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/45">Formato</p>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="formato" value="grande" defaultChecked={selectedFormats.includes("grande")} className="accent-purple-400" />Grande formato</label>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="formato" value="medio" defaultChecked={selectedFormats.includes("medio")} className="accent-purple-400" />Médio formato</label>
                <label className="flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="formato" value="pequeno" defaultChecked={selectedFormats.includes("pequeno")} className="accent-purple-400" />Pequeno formato</label>
              </div>
              <div>
                <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/45">Material</p>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="material" value="lona" defaultChecked={selectedMaterials.includes("lona")} className="accent-purple-400" />Lona</label>
                <label className="mb-1.5 flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="material" value="papel" defaultChecked={selectedMaterials.includes("papel")} className="accent-purple-400" />Papel</label>
                <label className="flex items-center gap-2 text-[0.8rem] text-white/75"><input type="checkbox" name="material" value="vinil" defaultChecked={selectedMaterials.includes("vinil")} className="accent-purple-400" />Vinil</label>
              </div>
              <button type="submit" className="home-btn-gradient focus-ring w-full justify-center">
                Aplicar filtros
              </button>
            </form>
          </details>

          <form method="get" action="/produtos" className="flex flex-col gap-2.5 rounded-[16px] border border-white/8 bg-white/[0.04] p-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:gap-2.5 md:p-3.5">
            {selectedCategory !== "todos" ? <input type="hidden" name="categoria" value={selectedCategory} /> : null}
            {selectedFormats.map((format) => (
              <input key={`bar-format-${format}`} type="hidden" name="formato" value={format} />
            ))}
            {selectedMaterials.map((material) => (
              <input key={`bar-material-${material}`} type="hidden" name="material" value={material} />
            ))}
            <input type="hidden" name="view" value={view} />
            <div className="flex h-10 flex-1 items-center gap-2 rounded-[10px] border border-white/8 bg-[#05070d] px-3">
              <span className="text-white/40"><SearchIcon /></span>
              <input
                name="q"
                defaultValue={query}
                placeholder="Buscar produto..."
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
              />
            </div>
            <p className="px-1 text-[0.82rem] text-white/60">{filteredProducts.length} produtos encontrados</p>
            <div className="flex items-center gap-1.5">
              <label htmlFor="ordenar" className="text-[0.8rem] text-white/60">Ordenar por</label>
              <select id="ordenar" name="sort" defaultValue={sortKey} className="h-10 rounded-[10px] border border-white/8 bg-[#05070d] px-2.5 text-sm text-white outline-none">
                <option value="mais-vendidos">Mais vendidos</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="nome">Nome</option>
              </select>
            </div>
            <div className="inline-flex h-10 items-center gap-1 rounded-[10px] border border-white/8 bg-[#05070d] p-1">
              <button name="view" value="grid" className={cn("rounded-md px-2 py-1 text-[0.68rem]", view === "grid" ? "bg-white/[0.12] text-white" : "text-white/50")}>Grid</button>
              <button name="view" value="list" className={cn("rounded-md px-2 py-1 text-[0.68rem]", view === "list" ? "bg-white/[0.12] text-white" : "text-white/50")}>Lista</button>
            </div>
          </form>

          <div className={cn("grid gap-3", view === "list" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4")}>
            {filteredProducts.map((product) => (
              <ProductListCard key={product.slug} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[16px] border border-white/8 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
              <p className="text-lg font-semibold text-white">Nenhum produto encontrado</p>
              <p className="mt-2 text-sm text-white/60">Ajuste os filtros ou limpe sua busca para ver o catálogo completo.</p>
              <Link href="/produtos" className="home-btn-gradient focus-ring mx-auto mt-5 inline-flex justify-center">
                Limpar filtros
              </Link>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 rounded-[16px] border border-white/8 bg-white/[0.04] px-4 py-3.5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.84rem] text-white/75">Frete grátis nas compras acima de <span className="font-semibold text-pink-300">R$ 299,00</span></p>
            <button type="button" className="focus-ring rounded-full border border-purple-400/35 px-4 py-2.5 text-[0.8rem] font-semibold text-white/90 transition hover:border-cyan-400/35">
              Ver condições de entrega
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

