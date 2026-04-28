import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/common/badge";
import { getProductPrimaryImagePath } from "@/lib/product-images";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { Product } from "@/types";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function normalizeCategoryKey(category: string) {
  return category
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Copy comercial por família — catálogo / página de produtos apenas */
const CATALOG_BENEFIT_BY_CATEGORY: Record<string, string> = {
  "grande formato":
    "Ideal para destacar sua marca em fachadas, eventos e pontos de venda.",
  "papelaria promocional":
    "Impressão profissional com acabamento resistente e visual de alto impacto.",
  "adesivos e aplicacao":
    "Versátil para vitrines, vidros e ambientação com comunicação aplicada.",
  "sinalizacao e exposicao":
    "Alta visibilidade para lojas, feiras e fachadas com leitura profissional.",
};

function getCatalogBenefitLine(product: Product) {
  const key = normalizeCategoryKey(product.category);
  if (CATALOG_BENEFIT_BY_CATEGORY[key]) {
    return CATALOG_BENEFIT_BY_CATEGORY[key];
  }
  if (product.lead && product.lead.length <= 140) {
    return product.lead;
  }
  return "Produção ágil, qualidade premium e suporte para sua arte do início ao fim.";
}

function getCatalogChips(product: Product): string[] {
  const chips: string[] = [];
  for (const app of product.applications) {
    if (chips.length >= 2) break;
    chips.push(app);
  }
  if (chips.length < 2) {
    chips.push("Suporte à arte");
  }
  const materialShort = product.materials[0]?.label;
  if (materialShort && chips.length < 3) {
    chips.push(materialShort.length > 28 ? `${materialShort.slice(0, 26)}…` : materialShort);
  } else if (chips.length < 3) {
    chips.push("15% no Pix");
  }
  return chips.slice(0, 3);
}

function CatalogProductCard({ product }: { product: Product }) {
  const imageSrc = getProductPrimaryImagePath(product.slug);
  const pixPrice = product.basePriceM2 * 0.85;
  const secondaryInfo =
    product.minQuantity > 1 ? `Pedido mín. ${product.minQuantity} un.` : `Área mín. ${product.minimumArea.toFixed(2)} m²`;
  const detailHref = `/products/${product.slug}`;
  const benefit = getCatalogBenefitLine(product);
  const chips = getCatalogChips(product);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/[0.08] bg-white",
        "shadow-[0_8px_30px_rgba(15,15,15,0.06)] transition duration-300",
        "hover:-translate-y-1 hover:border-black/12 hover:shadow-[0_22px_48px_rgba(15,15,15,0.11)]",
      )}
    >
      <Link
        href={detailHref}
        className="focus-ring relative mx-3 mt-3 block overflow-hidden rounded-[18px] bg-[#F3F4F6] ring-1 ring-black/[0.06] transition group-hover:ring-black/10 sm:mx-4 sm:mt-4 sm:rounded-[22px]"
        aria-label={`Ver ${product.name}`}
      >
        <div className="relative aspect-[1/1] w-full max-h-[260px] sm:aspect-[1/1] sm:max-h-[280px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-medium text-black/45">
              Imagem em breve
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5 pt-4 sm:p-5 sm:pt-6">
        <div className="min-h-0 flex-1 space-y-2.5 sm:space-y-3">
          <h3 className="display-title text-balance text-[1.28rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[1.55rem]">
            {product.name}
          </h3>
          <p
            className="text-balance text-[0.9375rem] font-medium leading-relaxed text-black/65 sm:text-[1rem]"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
            }}
          >
            {benefit}
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Diferenciais">
            {chips.map((chip, index) => (
              <li
                key={`${product.slug}-${index}-${chip}`}
                className="rounded-full border border-black/[0.08] bg-[#F9FAFB] px-3 py-1.5 text-[0.78rem] font-semibold text-black/70 sm:text-[0.8rem]"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-[18px] border border-black/[0.08] bg-[linear-gradient(180deg,#FAFAFB,#F3F4F6)] p-3.5 sm:mt-5 sm:rounded-[20px] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-black/50">A partir de (Pix)</p>
              <p className="display-title mt-1 text-[1.72rem] font-semibold tracking-tight text-ink sm:text-[2.1rem]">
                {formatCurrencyBRL(pixPrice)}
              </p>
              <p className="mt-0.5 text-[0.8125rem] font-medium leading-snug text-black/55 sm:text-sm">
                por m² · 15% de desconto no Pix
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 self-start rounded-full bg-ink px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white sm:self-end">
              Oferta Pix
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 border-t border-black/[0.08] pt-3 text-[0.8125rem] font-medium leading-snug text-black/58 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-sm">
            <span className="min-w-0 break-words">Cartão: {formatCurrencyBRL(product.basePriceM2)}/m²</span>
            <span className="text-black/52">{secondaryInfo}</span>
          </div>
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5 sm:mt-4 sm:flex-row sm:items-stretch">
          <Link
            href={detailHref}
            className="btn btn-primary focus-ring min-h-[48px] w-full flex-1 justify-center gap-2 px-4 text-[0.9375rem] sm:min-h-[52px] sm:w-auto sm:text-base"
          >
            Personalizar agora
            <ArrowIcon />
          </Link>
          <Link
            href={`/order?product=${product.slug}`}
            className="btn btn-secondary focus-ring min-h-[48px] w-full justify-center px-4 text-center text-[0.9rem] font-semibold text-black/80 sm:min-h-[52px] sm:w-auto sm:min-w-[10.5rem] sm:shrink-0 sm:text-[0.95rem]"
          >
            Fazer pedido
          </Link>
        </div>
        <Link
          href={detailHref}
          className="focus-ring mt-2.5 block text-center text-sm font-semibold text-black/45 underline-offset-4 transition hover:text-ink hover:underline sm:mt-3 sm:text-left"
        >
          Ver detalhes do produto
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({
  product,
  compact = false,
  variant = "default",
}: {
  product: Product;
  compact?: boolean;
  variant?: "default" | "home" | "catalog";
}) {
  if (variant === "catalog") {
    return <CatalogProductCard product={product} />;
  }

  const imageSrc = getProductPrimaryImagePath(product.slug);
  const isHomeVariant = variant === "home";
  const pixPrice = product.basePriceM2 * 0.85;
  const secondaryInfo =
    product.minQuantity > 1 ? `Pedido min. ${product.minQuantity}` : `Area min. ${product.minimumArea.toFixed(2)} m2`;
  const isCompactRelated = compact && !isHomeVariant;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border border-black/10 bg-white/98 transition duration-300",
        isCompactRelated
          ? "rounded-[20px] hover:-translate-y-0.5 hover:border-black/14 hover:shadow-[0_14px_36px_rgba(15,15,15,0.08)]"
          : "rounded-[34px] hover:-translate-y-1 hover:border-black/16 hover:shadow-[0_30px_72px_rgba(15,15,15,0.12)]",
      )}
    >
      {!isCompactRelated ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan via-magenta to-yellow opacity-95" />
          <div className="pointer-events-none absolute -right-14 -top-16 h-28 w-28 rounded-full bg-cyan/10 blur-2xl transition duration-500 group-hover:bg-cyan/14" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-24 w-24 rounded-full bg-magenta/10 blur-2xl transition duration-500 group-hover:bg-magenta/14" />
        </>
      ) : null}

      <div className={cn("relative flex h-full flex-col justify-between", isCompactRelated ? "p-3.5 sm:p-4" : "p-5 sm:p-6")}>
        <div className={cn("space-y-4", isCompactRelated && "space-y-2.5")}>
          <div
            className={cn(
              "relative overflow-hidden border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.96),rgba(244,245,247,0.88))]",
              isCompactRelated ? "rounded-[14px]" : "rounded-[30px]",
            )}
          >
            {!isCompactRelated ? (
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
                <Badge tone="cyan" className="shadow-[0_10px_24px_rgba(0,181,255,0.08)]">
                  {product.badge}
                </Badge>
                <span className="rounded-full border border-black/10 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/52">
                  {isHomeVariant ? "15% Pix" : product.category}
                </span>
              </div>
            ) : null}

            <div className={cn("relative overflow-hidden", isCompactRelated ? "aspect-[16/10]" : "aspect-[4/3]")}>
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className={cn("object-cover transition duration-500", isCompactRelated ? "object-center" : "group-hover:scale-[1.045]")}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              ) : null}
              {!isCompactRelated ? (
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_28%,rgba(15,15,15,0.16))]" />
              ) : null}
            </div>
          </div>

          <div className={cn("space-y-3", isHomeVariant && "space-y-2.5", isCompactRelated && "space-y-1.5")}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-black/44 sm:text-[0.68rem]">
                {product.category}
              </p>
              {!isCompactRelated ? (
                <span className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-black/56">
                  Alta procura
                </span>
              ) : (
                <span className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-black/52">
                  15% Pix
                </span>
              )}
            </div>
            <h3
              className={cn(
                "display-title font-semibold tracking-tight text-balance text-ink",
                isCompactRelated ? "text-[1.08rem] leading-tight sm:text-[1.2rem]" : "text-[1.52rem] leading-[0.98] sm:text-[1.72rem]",
              )}
            >
              {product.name}
            </h3>

            <p
              className={cn(
                "max-w-[34ch] text-sm leading-6 text-black/62",
                isHomeVariant && "text-black/56",
                isCompactRelated && "text-[0.8125rem] leading-snug text-black/58",
              )}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: isHomeVariant ? 2 : compact ? 2 : 3,
                overflow: "hidden",
              }}
            >
              {isHomeVariant ? product.materials[0]?.label ?? "Material comercial" : product.lead}
            </p>
          </div>

          {!isHomeVariant && !isCompactRelated ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="surface-muted px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-black/42">Material base</p>
                <p className="mt-2 text-sm font-medium text-ink">{product.materials[0]?.label ?? "Material comercial"}</p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-black/42">Prazo comercial</p>
                <p className="mt-2 text-sm font-medium text-ink">{product.deadlines[0]?.label ?? "Sob consulta"}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className={cn("space-y-4", isCompactRelated ? "mt-3 space-y-2.5" : "mt-5")}>
          <div
            className={cn(
              "border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.99),rgba(245,246,248,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
              isCompactRelated ? "rounded-[14px] p-3" : "rounded-[30px] p-4",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className={cn("label-kicker block", isCompactRelated && "text-[0.6rem]")}>Preco no Pix</span>
                <strong
                  className={cn(
                    "mt-1 block font-semibold tracking-tight text-ink sm:mt-2",
                    isCompactRelated ? "text-[1.35rem] sm:text-[1.5rem]" : "text-[2.05rem]",
                  )}
                >
                  {formatCurrencyBRL(pixPrice)}
                </strong>
                <span className={cn("mt-0.5 block font-medium text-black/48", isCompactRelated ? "text-xs" : "text-sm")}>
                  por m2
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full bg-ink font-semibold uppercase tracking-[0.14em] text-white",
                  isCompactRelated ? "px-2 py-1 text-[0.58rem]" : "px-3 py-1.5 text-[0.68rem] tracking-[0.18em] shadow-[0_14px_30px_rgba(15,15,15,0.16)]",
                )}
              >
                15% OFF
              </span>
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-t border-black/8 text-black/58",
                isCompactRelated ? "mt-2 pt-2 text-[0.7rem] sm:text-xs" : "mt-4 gap-3 pt-4 text-sm",
              )}
            >
              <span className="min-w-0">Cartao: {formatCurrencyBRL(product.basePriceM2)}</span>
              <span className="shrink-0">{secondaryInfo}</span>
            </div>
          </div>

          {!isCompactRelated ? (
            <div className="rounded-[22px] border border-cyan/16 bg-cyan/[0.06] px-4 py-3 text-[0.8rem] font-medium text-black/64">
              Compra guiada: configuracao clara, validacao da arte e fechamento com mais seguranca.
            </div>
          ) : null}

          <div className={cn("flex flex-wrap gap-2", isCompactRelated && "gap-2")}>
            <Link
              href={`/products/${product.slug}`}
              className={cn(
                "btn btn-primary focus-ring",
                isHomeVariant || isCompactRelated ? "w-full justify-center" : "flex-1",
                isCompactRelated && "min-h-[44px] py-2.5 text-sm",
              )}
            >
              Personalizar
              <ArrowIcon />
            </Link>
            {!compact && !isHomeVariant ? (
              <Link href={`/order?product=${product.slug}`} className="btn btn-secondary focus-ring">
                Enviar arte
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
