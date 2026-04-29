import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/common/product-card";
import { ProductRasterPicture } from "@/components/common/product-raster-picture";
import { SectionShell } from "@/components/common/section-shell";
import { HomeFeaturedProductsCarousel } from "@/components/home/home-featured-products-carousel";
import { getActiveProducts } from "@/lib/active-products";
import { cn, formatCurrencyBRL } from "@/lib/utils";

type AccentTone = "cyan" | "magenta" | "yellow";

const quickProductSlugs = ["banner", "backdrop", "wind-banner", "cartao", "adesivo", "folder"] as const;

const commercialCategories = [
  {
    title: "Grande Formato",
    description: "Banners, lonas e backdrops para fachada, campanha e ponto de venda.",
    href: "/products?q=Grande%20Formato",
    tone: "cyan" as AccentTone,
    highlights: ["Banner", "Backdrop", "Faixa impressa"],
  },
  {
    title: "Papelaria Promocional",
    description: "Cartões, folhetos e folders para apresentação e distribuição.",
    href: "/products?q=Papelaria%20Promocional",
    tone: "magenta" as AccentTone,
    highlights: ["Cartao", "Folheto", "Folder"],
  },
  {
    title: "Adesivos e Aplicacao",
    description: "Peças para vitrine, vidro, ambientação e comunicação aplicada.",
    href: "/products?q=Adesivos%20e%20Aplica%C3%A7%C3%A3o",
    tone: "yellow" as AccentTone,
    highlights: ["Adesivo", "Perfurado", "Vitrine"],
  },
  {
    title: "Sinalização e Exposição",
    description: "Placas, wind banners e totens para loja, evento e fachada.",
    href: "/products?q=Sinaliza%C3%A7%C3%A3o%20e%20Exposi%C3%A7%C3%A3o",
    tone: "cyan" as AccentTone,
    highlights: ["Placa ACM", "Wind banner", "Totem"],
  },
] as const;

const trustPoints = [
  {
    title: "Produção própria",
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
    text: "Linhas com produção ágil para compra mais segura.",
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

const heroBenefits = [
  {
    title: "Alta qualidade",
    text: "Impressão e acabamentos com padrão profissional.",
    icon: "quality",
  },
  {
    title: "Entrega rápida",
    text: "Fluxo ágil da arte à retirada ou envio.",
    icon: "truck",
  },
  {
    title: "Atendimento personalizado",
    text: "Equipe comercial alinhada ao seu projeto.",
    icon: "chat",
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

function BenefitGlyph({ kind }: { kind: string }) {
  const c = "h-5 w-5 text-cyan-300";
  switch (kind) {
    case "quality":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}>
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" strokeLinejoin="round" />
        </svg>
      );
    case "truck":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}>
          <path d="M14 16V6H4v12h2" strokeLinecap="round" />
          <path d="M14 16h4l3-4V8h-5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7.5" cy="16.5" r="2" />
          <circle cx="17.5" cy="16.5" r="2" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}>
          <path d="M8 10h8M8 14h5" strokeLinecap="round" />
          <path
            d="M18 8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6a2 2 0 0 0 2 2h2l3 3v-3h3a4 4 0 0 0 4-4V8Z"
            strokeLinejoin="round"
          />
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
          ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan/20 text-cyan-300"
          : tone === "magenta"
            ? "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300"
            : "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200"
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
          ? "rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cyan-200"
          : tone === "magenta"
            ? "rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-fuchsia-200"
            : "rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-100"
      }
    >
      {children}
    </span>
  );
}

export async function HomePage() {
  const products = await getActiveProducts();
  const quickProducts = quickProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<(typeof products)[number]> => Boolean(product));

  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);

  return (
    <div className="home-dark min-h-screen space-y-6 pb-16 sm:space-y-10 sm:pb-20">
      <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.04] shadow-[0_20px_64px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-95"
          style={{
            background:
              "radial-gradient(ellipse 85% 55% at 15% 25%, rgba(0, 181, 255, 0.22), transparent 52%), radial-gradient(ellipse 70% 50% at 88% 12%, rgba(168, 85, 247, 0.24), transparent 48%), radial-gradient(ellipse 55% 45% at 75% 88%, rgba(236, 72, 153, 0.18), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(6, 182, 212, 0.12), transparent 55%), linear-gradient(145deg, #070a12 0%, #05070d 38%, #0a0e18 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] home-hero-visual-noise mix-blend-overlay"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative grid gap-12 p-5 sm:gap-14 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10 xl:gap-16 xl:p-12">
          <div className="min-w-0">
            <p className="home-animate-in home-animate-delay-1 font-mono text-[0.62rem] font-semibold uppercase leading-relaxed tracking-[0.22em] text-cyan-200 sm:text-[0.68rem] sm:tracking-[0.26em]">
              Comunicação visual que destaca sua marca
            </p>
            <div className="home-hero-title-glow home-animate-in home-animate-delay-2 mt-5 sm:mt-7">
              <h1 className="font-display max-w-[20ch] text-balance text-[clamp(2.35rem,7.2vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-white xl:text-[4.35rem]">
                Soluções visuais que transformam{" "}
                <span className="inline-block bg-[linear-gradient(90deg,#fb923c_0%,#f472b6_28%,#c084fc_55%,#38bdf8_100%)] bg-clip-text text-transparent">
                  sua marca
                </span>
                .
              </h1>
            </div>
            <p className="home-animate-in home-animate-delay-3 mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:mt-6 md:text-lg md:leading-8">
              Produção gráfica de alta qualidade com agilidade, tecnologia e acabamento impecável.
            </p>
            <div className="home-animate-in home-animate-delay-4 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link href="/order" className="home-btn-gradient focus-ring w-full justify-center sm:w-auto sm:min-w-[200px]">
                Pedir agora
              </Link>
              <Link
                href="/produtos"
                className="home-btn-outline focus-ring w-full justify-center sm:w-auto sm:min-w-[180px]"
              >
                Ver catálogo
              </Link>
            </div>
          </div>

          <div className="home-animate-in home-animate-delay-3 relative flex min-h-[320px] items-center justify-center lg:min-h-[440px]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(112%,520px)] w-[min(112%,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(236,72,153,0.42) 0%, rgba(168,85,247,0.35) 28%, rgba(56,189,248,0.28) 52%, rgba(6,182,212,0.15) 68%, transparent 72%)",
              }}
              aria-hidden
            />
            <div
              className="home-hero-visual-float relative aspect-square w-full max-w-[min(100%,440px)] overflow-hidden rounded-full border border-white/8 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_100px_rgba(168,85,247,0.35),0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              style={{ transition: "box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <Image
                src="/card.png"
                alt="Marca Prismarq neon"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 440px"
                className="object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-full mix-blend-screen opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), transparent 45%), radial-gradient(circle at 70% 70%, rgba(56,189,248,0.25), transparent 50%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {heroBenefits.map((b) => (
          <div
            key={b.title}
            className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3.5 backdrop-blur-xl transition-all duration-300 ease-out hover:border-white/18 hover:bg-white/[0.06] sm:rounded-[22px] sm:px-5 sm:py-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
              <BenefitGlyph kind={b.icon} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-white">{b.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-white/70">{b.text}</p>
            </div>
          </div>
        ))}
      </div>

      <HomeFeaturedProductsCarousel
        items={products.slice(0, 8).map((product) => ({
          slug: product.slug,
          name: product.name,
          image: product.primaryImagePath,
        }))}
      />

      <section
        className={cn(
          "rounded-[22px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-5 lg:p-6",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.35)]",
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cyan-300/75">Acesso rápido</p>
            <h2 className="font-display mt-2 text-balance text-[clamp(1.45rem,4.2vw,3rem)] font-semibold leading-[1.05] tracking-tight text-white">
              Entre pelo produto e avance direto para a configuração.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70 md:text-lg md:leading-7">
              A vitrine prioriza os itens de giro mais rápido para reduzir cliques até o pedido.
            </p>
          </div>
          <Link
            href="/produtos"
            className="home-btn-outline focus-ring w-full shrink-0 justify-center sm:w-fit sm:px-6"
          >
            Ver catálogo completo
          </Link>
        </div>

        <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-6 lg:grid lg:snap-none lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:pb-0 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
          {quickProducts.map((product) => {
            const image = product.primaryImagePath ?? "/criativo1.png";
            const pixPrice = product.basePriceM2 * 0.85;

            return (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group relative w-[min(82vw,260px)] shrink-0 snap-start overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-[#05070d] backdrop-blur-xl transition-all duration-300 ease-out first:ml-0.5 last:mr-0.5 hover:scale-[1.03] hover:border-cyan-400/22 hover:shadow-[0_0_56px_rgba(56,189,248,0.18)] sm:w-[min(72vw,280px)] lg:ml-0 lg:mr-0 lg:w-auto lg:max-w-none lg:rounded-[26px] lg:first:ml-0 lg:last:mr-0"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-[#121722]">
                  <ProductRasterPicture
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 216px, 220px"
                    className="object-cover brightness-[1.02] transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:brightness-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(5,7,13,0.75))]" />
                </div>
                <div className="border-t border-white/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50">{product.category}</p>
                    <span className="rounded-full border border-pink-400/25 bg-pink-500/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-pink-200">
                      15% Pix
                    </span>
                  </div>
                  <p className="font-display mt-3 text-[1.12rem] font-semibold leading-tight text-white">{product.name}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/45">A partir de</p>
                      <p className="mt-1 text-base font-semibold text-white">{formatCurrencyBRL(pixPrice)}</p>
                    </div>
                    <span className="text-sm font-semibold text-cyan-300/80 transition duration-300 group-hover:text-cyan-200">
                      {">"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SectionShell
        variant="dark"
        eyebrow="Mais pedidos"
        title="Produtos prontos para decisão mais rápida."
        description="Imagem forte, preço no Pix e leitura curta para quem já quer abrir o configurador."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} compact variant="home" premiumDark />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        variant="dark"
        eyebrow="Categorias"
        title="Entre pela família certa e chegue mais rápido ao pedido."
        description="O catálogo está separado por lógica comercial para reduzir a leitura antes da ação."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {commercialCategories.map((category) => {
            const count = products.filter((product) => normalizeValue(product.category) === normalizeValue(category.title)).length;

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_0_36px_rgba(0,181,255,0.12)] sm:rounded-[26px] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <CategoryToneBadge tone={category.tone}>{`${count} produtos`}</CategoryToneBadge>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/70 transition duration-300 group-hover:border-white/25 group-hover:text-white">
                    Ver
                  </span>
                </div>

                <div className="mt-4 sm:mt-5">
                  <h3 className="font-display text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/70 sm:mt-3 sm:text-sm sm:leading-6">
                    {category.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {category.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/60"
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

      <section
        className={cn(
          "rounded-[22px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-6 lg:p-7",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.35)]",
        )}
      >
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-cyan-300/75">Confiança Prismarq</p>
            <h2 className="font-display mt-2 text-balance text-[clamp(1.45rem,4vw,2.6rem)] font-semibold leading-[1.05] tracking-tight text-white sm:leading-[1.02]">
              Produção direta, fechamento claro e atendimento comercial sem ruído.
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link href="/order" className="home-btn-gradient focus-ring w-full justify-center sm:w-auto sm:px-6">
              Enviar arte agora
            </Link>
            <Link href="/contact" className="home-btn-outline focus-ring w-full justify-center sm:w-auto sm:px-6">
              Falar com a equipe
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 md:grid-cols-2 xl:grid-cols-4">
          {trustPoints.map((point) => (
            <article
              key={point.title}
              className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <AccentDot tone={point.tone} icon={point.icon} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{point.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
