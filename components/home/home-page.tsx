import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/common/product-card";
import { SectionShell } from "@/components/common/section-shell";
import { products } from "@/lib/catalog";
import { getProductPrimaryImagePath } from "@/lib/product-images";
import { formatCurrencyBRL } from "@/lib/utils";
import heroLogoImage from "@/public/logo header.png";

type AccentTone = "cyan" | "magenta" | "yellow";

const quickProductSlugs = ["banner", "backdrop", "wind-banner", "cartao", "adesivo", "folder"] as const;

const commercialCategories = [
  {
    title: "Grande Formato",
    description: "Banners, lonas e backdrops para fachada, campanha e PDV.",
    href: "/products?q=Grande%20Formato",
    tone: "cyan" as AccentTone,
    highlights: ["Banner", "Backdrop", "Faixa impressa"],
  },
  {
    title: "Papelaria Promocional",
    description: "Cartoes, folhetos e folders para apresentacao e distribuicao.",
    href: "/products?q=Papelaria%20Promocional",
    tone: "magenta" as AccentTone,
    highlights: ["Cartao", "Folheto", "Folder"],
  },
  {
    title: "Adesivos e Aplicacao",
    description: "Pecas para vitrine, vidro, ambientacao e comunicacao aplicada.",
    href: "/products?q=Adesivos%20e%20Aplica%C3%A7%C3%A3o",
    tone: "yellow" as AccentTone,
    highlights: ["Adesivo", "Perfurado", "Vitrine"],
  },
  {
    title: "Sinalizacao e Exposicao",
    description: "Placas, wind banners e totens para loja, evento e fachada.",
    href: "/products?q=Sinaliza%C3%A7%C3%A3o%20e%20Exposi%C3%A7%C3%A3o",
    tone: "cyan" as AccentTone,
    highlights: ["Placa ACM", "Wind banner", "Totem"],
  },
] as const;

const trustPoints = [
  {
    title: "Producao propria",
    text: "Mais controle de acabamento, prazo e qualidade final.",
    icon: "factory",
    tone: "cyan" as AccentTone,
  },
  {
    title: "Atendimento direto",
    text: "Suporte comercial para validar material, medida e arte.",
    icon: "support",
    tone: "magenta" as AccentTone,
  },
  {
    title: "Prazo claro",
    text: "Linhas com producao agil para compra mais segura.",
    icon: "clock",
    tone: "yellow" as AccentTone,
  },
  {
    title: "Compra simples",
    text: "Escolha, configure, envie a arte e acompanhe o pedido.",
    icon: "spark",
    tone: "cyan" as AccentTone,
  },
] as const;

function normalizeValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function HubGlyph({ kind }: { kind: string }) {
  const className = "h-5 w-5";

  switch (kind) {
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M12 4l1.9 4.7L18.5 10.5l-4.6 1.8L12 17l-1.9-4.7-4.6-1.8 4.6-1.8L12 4Z" strokeLinejoin="round" />
        </svg>
      );
    case "factory":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4 19V10l5 3V10l5 3V8l6 3v8H4Z" strokeLinejoin="round" />
          <path d="M7 19v-4m4 4v-3m4 3v-2" strokeLinecap="round" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4 12a8 8 0 0 1 16 0" strokeLinecap="round" />
          <path d="M6 12v4a2 2 0 0 0 2 2h1" strokeLinecap="round" />
          <path d="M18 12v4a2 2 0 0 1-2 2h-1" strokeLinecap="round" />
          <path d="M9 19h6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function AccentDot({ tone, icon }: { tone: AccentTone; icon: string }) {
  return (
    <span
      className={
        tone === "cyan"
          ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan/10 text-cyan"
          : tone === "magenta"
            ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-magenta/10 text-magenta"
            : "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow/18 text-ink"
      }
    >
      <HubGlyph kind={icon} />
    </span>
  );
}

function CategoryToneBadge({ tone, children }: { tone: AccentTone; children: string | number }) {
  return (
    <span
      className={
        tone === "cyan"
          ? "rounded-full border border-cyan/16 bg-cyan/[0.08] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/58"
          : tone === "magenta"
            ? "rounded-full border border-magenta/16 bg-magenta/[0.08] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/58"
            : "rounded-full border border-yellow/24 bg-yellow/[0.18] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/58"
      }
    >
      {children}
    </span>
  );
}

export function HomePage() {
  const quickProducts = quickProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<(typeof products)[number]> => Boolean(product));

  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const heroProducts = quickProducts.slice(0, 3);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Inspirado em: https://www.360imprimir.com.br/ */}
      <section className="panel relative overflow-hidden p-5 sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-magenta/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-yellow/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div>
            <Link
              href="/"
              aria-label="Prismarq Comunicacao Visual"
              className="focus-ring mb-4 inline-flex max-w-full rounded-2xl sm:mb-5"
            >
              <Image
                src={heroLogoImage}
                alt="Prismarq Comunicacao Visual"
                priority
                sizes="(max-width: 640px) 268px, (max-width: 1024px) 320px, 400px"
                className="h-auto w-[min(100%,268px)] object-contain object-left sm:w-[min(100%,304px)] lg:w-[min(100%,340px)] xl:w-[min(100%,400px)]"
              />
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan/20 bg-cyan/[0.09] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink">
                Ecommerce grafico premium
              </span>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/58">
                Producao propria
              </span>
            </div>
            <h1 className="display-title mt-4 max-w-3xl text-[clamp(2rem,6vw,4rem)] font-semibold leading-[0.95] tracking-tight text-balance text-ink">
              Comunicacao visual profissional para sua marca vender mais, com pedido online simples e rapido.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-black/64 sm:text-[1.02rem]">
              Configure em poucos passos, envie a arte e acompanhe com suporte comercial. Retire seu pedido em ate 24 horas para itens elegiveis.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/order" className="btn btn-primary focus-ring min-w-[196px]">
                Comprar agora
              </Link>
              <Link href="/products" className="btn btn-secondary focus-ring">
                Ver categorias
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="surface-muted px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-black/44">Beneficio</p>
                <p className="mt-2 text-sm font-semibold text-ink">15% de desconto no Pix</p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-black/44">Prazo</p>
                <p className="mt-2 text-sm font-semibold text-ink">Retirada em ate 24 horas*</p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-black/44">Atendimento</p>
                <p className="mt-2 text-sm font-semibold text-ink">Suporte comercial direto</p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-black/44">Fluxo</p>
                <p className="mt-2 text-sm font-semibold text-ink">Configurou, enviou, aprovou</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="label-kicker">Produtos em destaque</p>
              <Link href="/products" className="text-xs font-semibold uppercase tracking-[0.16em] text-black/48 transition hover:text-ink">
                Ver catalogo
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {heroProducts.map((product) => {
                const image = getProductPrimaryImagePath(product.slug) ?? "/criativo1.png";
                const pixPrice = product.basePriceM2 * 0.85;

                return (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group flex items-center gap-3 rounded-[22px] border border-black/10 bg-white p-3 transition hover:-translate-y-0.5 hover:border-black/18 hover:shadow-[0_14px_36px_rgba(15,15,15,0.08)]"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
                      <Image src={image} alt={product.name} fill sizes="64px" className="object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/44">{product.category}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-ink">{product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-black/42">Pix</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{formatCurrencyBRL(pixPrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 rounded-[20px] border border-[#E5E7EB] bg-[#F3F4F6] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/48">Confianca na compra</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold text-black/62">Pagamento seguro</span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold text-black/62">Revisao comercial</span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold text-black/62">Suporte pos-venda</span>
              </div>
            </div>
            <Link href="/order" className="btn btn-primary focus-ring mt-4 w-full justify-center">
              Configurar e enviar arte
            </Link>
            <p className="mt-2 text-[0.74rem] text-black/46">*Consulte disponibilidade por produto e horario de fechamento.</p>
          </div>
        </div>
      </section>

      <section className="panel p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="label-kicker">Acesso rapido</p>
            <h2 className="display-title mt-2 text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-[1.01] tracking-tight text-balance">
              Entre pelo produto e avance direto para a configuracao.
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/62">
              A vitrine prioriza os itens de giro mais rapido para reduzir cliques ate o pedido.
            </p>
          </div>
          <Link href="/products" className="btn btn-secondary focus-ring w-fit">
            Ver catalogo completo
          </Link>
        </div>

        <div className="mt-6 grid auto-cols-[216px] grid-flow-col gap-3 overflow-x-auto pb-2 lg:grid-cols-3 lg:auto-cols-fr lg:grid-flow-row xl:grid-cols-6">
          {quickProducts.map((product) => {
            const image = getProductPrimaryImagePath(product.slug) ?? "/criativo1.png";
            const pixPrice = product.basePriceM2 * 0.85;

            return (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group relative overflow-hidden rounded-[30px] border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-black/18 hover:shadow-[0_24px_56px_rgba(15,15,15,0.08)]"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-[linear-gradient(180deg,rgba(250,250,251,0.94),rgba(244,245,247,0.86))]">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 216px, 220px"
                    className="object-cover transition duration-500 group-hover:scale-[1.045]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0)_30%,rgba(15,15,15,0.18))]" />
                </div>
                <div className="border-t border-black/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42">{product.category}</p>
                    <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-black/56">
                      15% Pix
                    </span>
                  </div>
                  <p className="display-title mt-3 text-[1.12rem] font-semibold leading-tight text-ink">{product.name}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-black/40">A partir de</p>
                      <p className="mt-1 text-base font-semibold text-ink">{formatCurrencyBRL(pixPrice)}</p>
                    </div>
                    <span className="text-sm font-semibold text-black/38 transition duration-300 group-hover:text-black/62">{">"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SectionShell
        eyebrow="Mais pedidos"
        title="Produtos prontos para decisao mais rapida."
        description="Imagem forte, preco no Pix e leitura curta para quem ja quer abrir o configurador."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} compact variant="home" />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Categorias"
        title="Entre pela familia certa e chegue mais rapido ao pedido."
        description="O catalogo esta separado por logica comercial para reduzir a leitura antes da acao."
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {commercialCategories.map((category) => {
            const count = products.filter((product) => normalizeValue(product.category) === normalizeValue(category.title)).length;

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group panel flex h-full flex-col justify-between overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-black/16 hover:shadow-[0_24px_60px_rgba(15,15,15,0.09)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <CategoryToneBadge tone={category.tone}>{`${count} produtos`}</CategoryToneBadge>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-black/42 transition duration-300 group-hover:border-black/16 group-hover:text-ink">
                    Ver
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="display-title text-2xl font-semibold tracking-tight text-ink">{category.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/62">{category.description}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {category.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-black/10 bg-black/[0.025] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-black/58"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </SectionShell>

      <section className="panel p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="label-kicker">Confianca Prismarq</p>
            <h2 className="display-title mt-2 text-[clamp(1.7rem,2.6vw,2.6rem)] font-semibold leading-[1.02] tracking-tight text-balance">
              Producao direta, fechamento claro e atendimento comercial sem ruido.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/order" className="btn btn-primary focus-ring">
              Enviar arte agora
            </Link>
            <Link href="/contact" className="btn btn-secondary focus-ring">
              Falar com a equipe
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((point) => (
            <article key={point.title} className="surface-card p-4">
              <div className="flex items-center gap-3">
                <AccentDot tone={point.tone} icon={point.icon} />
                <div>
                  <h3 className="text-sm font-semibold text-ink">{point.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-black/58">{point.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
