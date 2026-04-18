import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/common/badge";
import { getProductPrimaryImagePath } from "@/lib/product-images";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { Product } from "@/types";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductCard({
  product,
  compact = false,
  variant = "default",
}: {
  product: Product;
  compact?: boolean;
  variant?: "default" | "home";
}) {
  const imageSrc = getProductPrimaryImagePath(product.slug);
  const isHomeVariant = variant === "home";
  const pixPrice = product.basePriceM2 * 0.85;
  const secondaryInfo =
    product.minQuantity > 1 ? `Pedido min. ${product.minQuantity}` : `Area min. ${product.minimumArea.toFixed(2)} m2`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[34px] border border-black/10 bg-white/98 transition duration-300",
        "hover:-translate-y-1 hover:border-black/16 hover:shadow-[0_26px_64px_rgba(15,15,15,0.1)]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan via-magenta to-yellow opacity-95" />

      <div className={cn("relative flex h-full flex-col justify-between p-5", compact ? "sm:p-5" : "sm:p-6")}>
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.96),rgba(244,245,247,0.88))]">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
              <Badge tone="cyan" className="shadow-[0_10px_24px_rgba(0,181,255,0.08)]">
                {product.badge}
              </Badge>
              <span className="rounded-full border border-black/10 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/52">
                {isHomeVariant ? "15% Pix" : product.category}
              </span>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.045]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_28%,rgba(15,15,15,0.16))]" />
            </div>
          </div>

          <div className={cn("space-y-3", isHomeVariant && "space-y-2.5")}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/44">{product.category}</p>
            <h3 className="display-title text-[1.52rem] font-semibold leading-[0.98] tracking-tight text-balance text-ink sm:text-[1.72rem]">
              {product.name}
            </h3>

            <p
              className={cn("max-w-[34ch] text-sm leading-6 text-black/62", isHomeVariant && "text-black/56")}
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

          {!isHomeVariant ? (
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

        <div className="mt-5 space-y-4">
          <div className="rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(250,250,251,0.99),rgba(245,246,248,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="label-kicker block">Preco no Pix</span>
                <strong className="mt-2 block text-[2.05rem] font-semibold tracking-tight text-ink">
                  {formatCurrencyBRL(pixPrice)}
                </strong>
                <span className="mt-1 block text-sm font-medium text-black/48">por m2</span>
              </div>
              <span className="rounded-full bg-ink px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(15,15,15,0.16)]">
                15% OFF
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/8 pt-4 text-sm text-black/58">
              <span>No cartao: {formatCurrencyBRL(product.basePriceM2)}</span>
              <span>{secondaryInfo}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/products/${product.slug}`}
              className={cn("btn btn-primary focus-ring", isHomeVariant ? "w-full justify-center" : "flex-1")}
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
