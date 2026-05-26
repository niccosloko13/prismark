import { getActiveProductSnapshotBySlug, type ActiveProduct } from "@/lib/active-product-snapshot";
import {
  formatCustomSizeLabel,
  normalizeCustomSizeUnit,
  PRISMARQ_CUSTOM_FORMAT_ID,
  type CustomSizeUnit,
} from "@/lib/custom-product-size";
import { getProductConfiguration } from "@/lib/catalog";
import { formatCurrencyBRL, roundTo } from "@/lib/utils";
import { getDefaultMeasuresForProduct, getPreferredDeadlineLabel } from "@/lib/order-presets";
import type { Product } from "@/types";

const storeExperienceBySlug = new Map<string, ProductExperience>();

export function setStoreProductExperiences(entries: Array<{ slug: string; experience: ProductExperience }>) {
  storeExperienceBySlug.clear();
  for (const { slug, experience } of entries) {
    storeExperienceBySlug.set(slug.trim().toLowerCase(), experience);
  }
}

export function clearStoreProductExperiences() {
  storeExperienceBySlug.clear();
}

export type ProductAccent = "cyan" | "magenta" | "yellow";

export interface ProductGalleryItem {
  id: string;
  title: string;
  subtitle: string;
  caption?: string;
  tags?: string[];
  accent: ProductAccent;
  src: string;
  srcCandidates?: string[];
}

export interface ProductModelOption {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  formatId: string;
  material?: string;
  finishing?: string;
  colorId: string;
  enhancementId: string;
}

export interface ProductFormatOption {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
  recommended?: boolean;
}

export interface ProductColorOption {
  id: string;
  label: string;
  description: string;
  swatch: string;
}

export interface ProductEnhancementOption {
  id: string;
  label: string;
  description: string;
  priceLabel: string;
}

export interface ProductAddonService {
  id: string;
  label: string;
  description: string;
  priceLabel: string;
  feeBrl: number;
  highlighted?: boolean;
}

export interface ProductDownloadAsset {
  id: string;
  label: string;
  description: string;
  href: string;
  downloadName: string;
  icon: "illustrator" | "corel" | "pdf";
}

export interface ProductExperience {
  rating: {
    value: number;
    reviews: number;
    caption: string;
  };
  gallery: ProductGalleryItem[];
  models: ProductModelOption[];
  formats: ProductFormatOption[];
  colors: ProductColorOption[];
  enhancements: ProductEnhancementOption[];
  addons: ProductAddonService[];
  specs: Array<{ label: string; value: string }>;
  downloads: ProductDownloadAsset[];
  shipping: {
    placeholder: string;
    note: string;
  };
  quantityTiers: number[];
}

export interface ProductSelectionState {
  modelId: string;
  formatId: string;
  width: number;
  height: number;
  customSizeUnit?: CustomSizeUnit;
  colorId: string;
  enhancementId: string;
  material: string;
  finishing: string;
  deadline: string;
  quantity: number;
  selectedAddonIds: string[];
}

const accentSets: Record<"bold" | "tech" | "premium", [ProductAccent, ProductAccent, ProductAccent]> = {
  bold: ["cyan", "magenta", "yellow"],
  tech: ["cyan", "yellow", "magenta"],
  premium: ["yellow", "cyan", "magenta"],
};

const galleryCopyByKind: Record<
  string,
  Array<{ title: string; subtitle: string }>
> = {
  large: [
    { title: "Impacto em fachada", subtitle: "Leitura forte com presenÃ§a de rua." },
    { title: "Detalhe de acabamento", subtitle: "IlhÃ³s, reforÃ§o e corte limpo." },
    { title: "AplicaÃ§Ã£o coordenada", subtitle: "Visual pronto para operaÃ§Ã£o." },
    { title: "Linha de produÃ§Ã£o", subtitle: "Controle visual da peÃ§a antes do envio." },
  ],
  adhesive: [
    { title: "Vitrine de precisÃ£o", subtitle: "Adesivo com leitura limpa e recorte." },
    { title: "Camada tÃ©cnica", subtitle: "LaminaÃ§Ã£o e proteÃ§Ã£o para alto uso." },
    { title: "AplicaÃ§Ã£o em vidro", subtitle: "Encaixe visual para retail e PDV." },
    { title: "ProduÃ§Ã£o plana", subtitle: "PeÃ§a pronta para expediÃ§Ã£o." },
  ],
  card: [
    { title: "Frente editorial", subtitle: "CartÃ£o com apresentaÃ§Ã£o refinada." },
    { title: "SuperfÃ­cie premium", subtitle: "Papel e acabamento em alto padrÃ£o." },
    { title: "Lote organizado", subtitle: "ProduÃ§Ã£o pensada para escala." },
    { title: "Fechamento institucional", subtitle: "Pronto para networking e marca." },
  ],
  rigid: [
    { title: "Painel arquitetÃ´nico", subtitle: "Rigidez e presenÃ§a para fachada." },
    { title: "FixaÃ§Ã£o tÃ©cnica", subtitle: "Detalhes para montagem precisa." },
    { title: "Placa em escala", subtitle: "AplicaÃ§Ã£o corporativa ou comercial." },
    { title: "Projeto premium", subtitle: "Acabamento robusto e limpo." },
  ],
  vertical: [
    { title: "Leitura vertical", subtitle: "Alta visibilidade em Ã¡rea externa." },
    { title: "Base reforÃ§ada", subtitle: "Estrutura pronta para vento e fluxo." },
    { title: "AtivaÃ§Ã£o de evento", subtitle: "PeÃ§a pronta para instalaÃ§Ã£o rÃ¡pida." },
    { title: "Conjunto de produÃ§Ã£o", subtitle: "Detalhe de costura e suporte." },
  ],
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inferVisualKind(product: Product) {
  if (product.slug === "adesivo" || product.slug === "adesivo-perfurado") {
    return "adhesive";
  }

  if (product.slug === "cartao" || product.slug === "folheto" || product.slug === "folder") {
    return "card";
  }

  if (product.slug === "wind-banner") {
    return "vertical";
  }

  if (product.slug.startsWith("placa") || product.slug === "totem") {
    return "rigid";
  }

  return "large";
}

function inferPalette(product: Product) {
  if (product.slug === "cartao" || product.slug === "folheto" || product.slug === "folder") {
    return accentSets.premium;
  }

  if (product.slug.startsWith("placa") || product.slug === "totem") {
    return accentSets.tech;
  }

  return accentSets.bold;
}

function createArtworkSvg(product: Product, variant: number, kind: string) {
  const palette = inferPalette(product);
  const primary = palette[variant % palette.length];
  const secondary = palette[(variant + 1) % palette.length];
  const tertiary = palette[(variant + 2) % palette.length];
  const defaultMeasures = getDefaultMeasuresForProduct(product);
  const title = escapeXml(product.name);
  const category = escapeXml(product.category);
  const lead = escapeXml(product.lead);
  const sizeLabel = `${defaultMeasures.width} x ${defaultMeasures.height} cm`;

  const shapeMarkup = {
    large: `
      <rect x="140" y="150" width="1220" height="700" rx="60" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" />
      <rect x="210" y="230" width="1080" height="70" rx="35" fill="rgba(15,15,15,0.22)" />
      <rect x="210" y="330" width="700" height="450" rx="50" fill="url(#sheet)" stroke="rgba(255,255,255,0.22)" />
      <path d="M260 670 L630 340 L930 460 L1220 250" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="360" cy="690" r="42" fill="${primary === "cyan" ? "#00B5FF" : primary === "magenta" ? "#FF2EBF" : "#FFD300"}" />
      <circle cx="1030" cy="590" r="72" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" />
    `,
    adhesive: `
      <rect x="160" y="150" width="1180" height="720" rx="70" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.26)" />
      <circle cx="470" cy="520" r="250" fill="url(#sheet)" />
      <circle cx="930" cy="430" r="180" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)" stroke-width="14" />
      <rect x="770" y="620" width="350" height="90" rx="45" fill="rgba(15,15,15,0.26)" />
      <path d="M250 760 C390 620, 560 640, 700 520" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="22" stroke-linecap="round" />
    `,
    card: `
      <rect x="220" y="250" width="1080" height="640" rx="60" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" />
      <rect x="360" y="330" width="560" height="330" rx="42" fill="rgba(15,15,15,0.2)" transform="rotate(-8 640 500)" />
      <rect x="470" y="370" width="560" height="330" rx="42" fill="url(#sheet)" transform="rotate(4 750 540)" />
      <rect x="580" y="410" width="350" height="140" rx="28" fill="rgba(255,255,255,0.14)" transform="rotate(6 760 480)" />
      <path d="M430 720 H1120" stroke="rgba(255,255,255,0.72)" stroke-width="18" stroke-linecap="round" />
    `,
    rigid: `
      <rect x="180" y="170" width="1160" height="720" rx="52" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.24)" />
      <rect x="260" y="240" width="1000" height="520" rx="36" fill="url(#sheet)" />
      <circle cx="320" cy="300" r="18" fill="rgba(255,255,255,0.76)" />
      <circle cx="1180" cy="300" r="18" fill="rgba(255,255,255,0.76)" />
      <circle cx="320" cy="700" r="18" fill="rgba(255,255,255,0.76)" />
      <circle cx="1180" cy="700" r="18" fill="rgba(255,255,255,0.76)" />
      <path d="M420 640 C650 440, 850 520, 1040 320" fill="none" stroke="rgba(255,255,255,0.76)" stroke-width="18" stroke-linecap="round" />
    `,
    vertical: `
      <rect x="350" y="140" width="900" height="760" rx="70" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.24)" />
      <path d="M610 240 C750 290, 870 450, 780 710 C720 860, 560 840, 540 680 C510 520, 500 410, 610 240 Z" fill="url(#sheet)" />
      <rect x="570" y="150" width="120" height="780" rx="60" fill="rgba(15,15,15,0.24)" />
      <circle cx="630" cy="220" r="34" fill="rgba(255,255,255,0.76)" />
      <circle cx="630" cy="760" r="34" fill="rgba(255,255,255,0.76)" />
    `,
  }[kind];

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" fill="none">
      <defs>
        <linearGradient id="bg" x1="140" y1="120" x2="1460" y2="1080" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${primary === "cyan" ? "#00B5FF" : primary === "magenta" ? "#FF2EBF" : "#FFD300"}" stop-opacity="0.98" />
          <stop offset="55%" stop-color="#111111" stop-opacity="0.92" />
          <stop offset="100%" stop-color="${tertiary === "cyan" ? "#00B5FF" : tertiary === "magenta" ? "#FF2EBF" : "#FFD300"}" stop-opacity="0.92" />
        </linearGradient>
        <linearGradient id="sheet" x1="260" y1="240" x2="1180" y2="820" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="rgba(255,255,255,0.88)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.24)" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(350 260) rotate(53) scale(980 860)">
          <stop stop-color="rgba(255,255,255,0.22)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1200" rx="80" fill="url(#bg)" />
      <rect width="1600" height="1200" rx="80" fill="url(#glow)" />
      <path d="M0 920 C260 780, 450 880, 700 790 C1000 680, 1280 760, 1600 630 V1200 H0 Z" fill="rgba(255,255,255,0.06)" />
      <path d="M0 220 C220 180, 360 120, 520 210 C680 300, 860 160, 1080 230 C1270 292, 1420 260, 1600 160 V0 H0 Z" fill="rgba(255,255,255,0.08)" />
      ${shapeMarkup}
      <g>
        <rect x="96" y="92" width="220" height="52" rx="26" fill="rgba(15,15,15,0.28)" />
        <text x="128" y="126" fill="white" font-size="24" font-weight="700" letter-spacing="4">PRISMARQ</text>
        <text x="96" y="1016" fill="white" font-size="68" font-weight="800" font-family="Aptos, Segoe UI, sans-serif">${title}</text>
        <text x="96" y="1076" fill="rgba(255,255,255,0.78)" font-size="30" font-weight="500" font-family="Aptos, Segoe UI, sans-serif">${category} Â· ${escapeXml(sizeLabel)}</text>
        <text x="96" y="1130" fill="rgba(255,255,255,0.8)" font-size="24" font-weight="500" font-family="Aptos, Segoe UI, sans-serif">${lead}</text>
      </g>
      <g opacity="0.92">
        <rect x="1100" y="92" width="320" height="52" rx="26" fill="rgba(255,255,255,0.12)" />
        <text x="1140" y="126" fill="white" font-size="22" font-weight="700" letter-spacing="2">${variant === 0 ? "VISÃƒO PRINCIPAL" : variant === 1 ? "DETALHE TÃ‰CNICO" : variant === 2 ? "APLICAÃ‡ÃƒO REAL" : "PRÃ‰-IMPRESSÃƒO"}</text>
      </g>
    </svg>
  `)}`;
}

function createTemplateSvg(product: Product, formatLabel: string, kind: string) {
  const palette = inferPalette(product);
  const primary = palette[0];
  const secondary = palette[1];
  const tertiary = palette[2];
  const measures = getDefaultMeasuresForProduct(product);
  const productTitle = escapeXml(product.name);
  const dimensions = escapeXml(formatLabel);
  const fileHint = kind === "pdf" ? "PDF PREVIEW" : kind === "corel" ? "COREL DRAW" : "ILLUSTRATOR";

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="80" x2="1080" y2="720" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${primary === "cyan" ? "#00B5FF" : primary === "magenta" ? "#FF2EBF" : "#FFD300"}" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#111111" stop-opacity="0.03" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" rx="48" fill="white" />
      <rect x="40" y="40" width="1120" height="720" rx="36" fill="url(#bg)" stroke="rgba(15,15,15,0.12)" />
      <rect x="96" y="92" width="280" height="52" rx="26" fill="rgba(15,15,15,0.92)" />
      <text x="132" y="126" fill="white" font-size="24" font-weight="700" letter-spacing="4">PRISMARQ</text>
      <text x="96" y="214" fill="#0f0f0f" font-size="52" font-weight="800" font-family="Aptos, Segoe UI, sans-serif">${productTitle}</text>
      <text x="96" y="270" fill="rgba(15,15,15,0.72)" font-size="26" font-weight="500" font-family="Aptos, Segoe UI, sans-serif">Template base para exportaÃ§Ã£o e aprovaÃ§Ã£o visual.</text>
      <g>
        <rect x="96" y="336" width="1008" height="308" rx="32" fill="white" stroke="rgba(15,15,15,0.12)" stroke-dasharray="14 14" />
        <rect x="152" y="392" width="896" height="196" rx="24" fill="rgba(255,255,255,0.92)" stroke="rgba(15,15,15,0.08)" />
        <path d="M188 530 L512 368 L688 454 L948 362" stroke="${secondary === "cyan" ? "#00B5FF" : secondary === "magenta" ? "#FF2EBF" : "#FFD300"}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M246 480 H934" stroke="rgba(15,15,15,0.18)" stroke-width="10" stroke-dasharray="18 16" />
        <path d="M246 562 H934" stroke="rgba(15,15,15,0.18)" stroke-width="10" stroke-dasharray="18 16" />
      </g>
      <text x="96" y="706" fill="rgba(15,15,15,0.8)" font-size="22" font-weight="700" font-family="Aptos, Segoe UI, sans-serif">Formato sugerido: ${dimensions} Â· Sangria tÃ©cnica e Ã¡rea segura jÃ¡ indicadas.</text>
      <text x="876" y="706" fill="rgba(15,15,15,0.86)" font-size="22" font-weight="700" font-family="Aptos, Segoe UI, sans-serif">${fileHint} Â· ${measures.width} x ${measures.height} cm</text>
      <circle cx="1036" cy="144" r="58" fill="${tertiary === "cyan" ? "#00B5FF" : tertiary === "magenta" ? "#FF2EBF" : "#FFD300"}" fill-opacity="0.18" />
    </svg>
  `)}`;
}

function galleryCopy(product: Product, kind: string) {
  const copies = galleryCopyByKind[kind] ?? galleryCopyByKind.large;
  return copies.map((copy, index) => ({
    id: `${product.slug}-${index}`,
    title: copy.title,
    subtitle: copy.subtitle,
    accent: (index % 3 === 0 ? "cyan" : index % 3 === 1 ? "magenta" : "yellow") as ProductAccent,
    src: createArtworkSvg(product, index, kind),
  }));
}

function buildFormats(product: Product) {
  const base = getDefaultMeasuresForProduct(product);
  const compact = {
    id: "compacto",
    label: "Compacto",
    description: "Entrega mais enxuta com foco em economia e agilidade.",
    width: Math.max(1, Math.round(base.width * 0.82)),
    height: Math.max(1, Math.round(base.height * 0.82)),
  };
  const standard = {
    id: "padrao",
    label: "PadrÃ£o",
    description: "Formato principal recomendado para o fluxo comercial.",
    width: base.width,
    height: base.height,
    recommended: true,
  };
  const impact = {
    id: "impacto",
    label: "Impacto",
    description: "Maior Ã¡rea visual para campanhas, fachadas e ativaÃ§Ãµes.",
    width: Math.max(1, Math.round(base.width * 1.2)),
    height: Math.max(1, Math.round(base.height * 1.2)),
  };

  return [compact, standard, impact];
}

function buildColors(product: Product) {
  const palette = inferPalette(product);
  return [
    {
      id: "cmyk-full",
      label: "CMYK completo",
      description: "Melhor leitura de cor para peÃ§as vibrantes e premium.",
      swatch:
        palette[0] === "cyan"
          ? "linear-gradient(135deg, #00B5FF 0%, #FF2EBF 55%, #FFD300 100%)"
          : palette[0] === "yellow"
            ? "linear-gradient(135deg, #FFD300 0%, #00B5FF 52%, #FF2EBF 100%)"
            : "linear-gradient(135deg, #FF2EBF 0%, #00B5FF 52%, #FFD300 100%)",
    },
    {
      id: "frente",
      label: "Frente colorida",
      description: "Tinta na face principal com economia inteligente.",
      swatch: "linear-gradient(135deg, rgba(15,15,15,0.92) 0%, rgba(15,15,15,0.18) 100%)",
    },
    {
      id: "dupla-leitura",
      label: "Dupla leitura",
      description: "Alto contraste para comunicaÃ§Ã£o dos dois lados.",
      swatch: "linear-gradient(135deg, #00B5FF 0%, rgba(255,255,255,0.84) 50%, #FF2EBF 100%)",
    },
  ];
}

function buildEnhancements(product: Product) {
  const kind = inferVisualKind(product);

  if (kind === "card") {
    return [
      {
        id: "sem-enobrecimento",
        label: "Sem enobrecimento",
        description: "ProduÃ§Ã£o enxuta para prazo rÃ¡pido.",
        priceLabel: "Incluso",
      },
      {
        id: "laminacao-fosca",
        label: "LaminaÃ§Ã£o fosca",
        description: "Toque premium e proteÃ§Ã£o adicional.",
        priceLabel: "sob consulta",
      },
      {
        id: "verniz-local",
        label: "Verniz local UV",
        description: "Realce de marca e pontos de destaque.",
        priceLabel: "sob consulta",
      },
    ];
  }

  return [
    {
      id: "sem-enobrecimento",
      label: "Sem enobrecimento",
      description: "Fluxo direto para peÃ§as comerciais e tÃ¡ticas.",
      priceLabel: "Incluso",
    },
    {
      id: "laminacao-fosca",
      label: "LaminaÃ§Ã£o fosca",
      description: "ProteÃ§Ã£o e acabamento elegante.",
      priceLabel: "sob consulta",
    },
    {
      id: "laminacao-brilho",
      label: "LaminaÃ§Ã£o brilho",
      description: "Mais presenÃ§a e contraste de impressÃ£o.",
      priceLabel: "sob consulta",
    },
    {
      id: "verniz-local",
      label: "Verniz UV",
      description: "Destaque para identidade e textos chave.",
      priceLabel: "sob consulta",
    },
  ];
}

function buildAddons() {
  return [
    {
      id: "arte",
      label: "CriaÃ§Ã£o de arte",
      description: "Layout profissional desenvolvido pela equipe Prismarq.",
      priceLabel: "a partir de R$ 95",
      feeBrl: 95,
      highlighted: true,
    },
    {
      id: "checagem",
      label: "Checagem de arquivo",
      description: "Ajuste tÃ©cnico de sangria, margem e formato final.",
      priceLabel: "a partir de R$ 35",
      feeBrl: 35,
    },
  ];
}

export function getAddonsFeeTotalByIds(experience: ProductExperience, addonIds: string[]): number {
  if (addonIds.length === 0) {
    return 0;
  }

  return roundTo(
    experience.addons.filter((item) => addonIds.includes(item.id)).reduce((sum, item) => sum + item.feeBrl, 0),
    2,
  );
}

export function getAddonsFeeTotalBrl(experience: ProductExperience, selection: ProductSelectionState): number {
  return getAddonsFeeTotalByIds(experience, selection.selectedAddonIds);
}

function buildSpecs(product: Product) {
  const measures = getDefaultMeasuresForProduct(product);
  return [
    { label: "Categoria", value: product.category },
    { label: "Ãrea mÃ­nima", value: `${product.minimumArea.toFixed(2)} mÂ²` },
    { label: "PreÃ§o base", value: `${formatCurrencyBRL(product.basePriceM2)}/mÂ²` },
    { label: "DimensÃ£o padrÃ£o", value: `${measures.width} x ${measures.height} cm` },
    { label: "Materiais disponÃ­veis", value: product.materials.map((item) => item.label).join(" Â· ") },
    { label: "Acabamentos", value: product.finishings.map((item) => item.label).join(" Â· ") },
    { label: "Prazos", value: product.deadlines.map((item) => item.label).join(" Â· ") },
    { label: "AplicaÃ§Ãµes", value: (product.applications ?? []).join(" Â· ") },
  ];
}

function buildDownloads(product: Product) {
  const defaultFormat = getDefaultMeasuresForProduct(product);
  const formatLabel = `${defaultFormat.width} x ${defaultFormat.height} cm`;
  return [
    {
      id: "illustrator",
      label: "Illustrator",
      description: "Base vetorial pronta para ediÃ§Ã£o no Adobe Illustrator.",
      href: createTemplateSvg(product, formatLabel, "illustrator"),
      downloadName: `${product.slug}-illustrator.svg`,
      icon: "illustrator" as const,
    },
    {
      id: "corel",
      label: "Corel",
      description: "Arquivo base para ediÃ§Ã£o rÃ¡pida em CorelDRAW.",
      href: createTemplateSvg(product, formatLabel, "corel"),
      downloadName: `${product.slug}-corel.svg`,
      icon: "corel" as const,
    },
    {
      id: "pdf",
      label: "PDF",
      description: "Preview tÃ©cnico para aprovaÃ§Ã£o e alinhamento comercial.",
      href: createTemplateSvg(product, formatLabel, "pdf"),
      downloadName: `${product.slug}-pdf-template.svg`,
      icon: "pdf" as const,
    },
  ];
}

function buildModels(product: Product, formats: ProductFormatOption[], colors: ProductColorOption[], enhancements: ProductEnhancementOption[]) {
  const kind = inferVisualKind(product);
  const recommendedMaterial = product.materials[0]?.label ?? "";
  const premiumMaterial = product.materials[1]?.label ?? recommendedMaterial;
  const topMaterial = product.materials[2]?.label ?? premiumMaterial;
  const recommendedFinishing = product.finishings[0]?.label ?? "";
  const refinedFinishing = product.finishings[1]?.label ?? recommendedFinishing;
  const premiumFinishing = product.finishings[2]?.label ?? refinedFinishing;

  const labelsByKind: Record<string, [string, string, string]> = {
    large: ["Essencial", "Impacto", "Fachada premium"],
    adhesive: ["Vitrine", "Recorte premium", "AplicaÃ§Ã£o total"],
    card: ["ClÃ¡ssico", "Executivo", "CartÃ£o premium"],
    rigid: ["SinalizaÃ§Ã£o", "Corporativo", "ArquitetÃ´nico"],
    vertical: ["Evento", "Campo", "Estrutura completa"],
  };

  const [first, second, third] = labelsByKind[kind] ?? labelsByKind.large;

  return [
    {
      id: "modelo-1",
      label: first,
      description: "Fluxo direto com foco em velocidade de produÃ§Ã£o.",
      recommended: true,
      formatId: formats[1]?.id ?? formats[0].id,
      material: recommendedMaterial,
      finishing: recommendedFinishing,
      colorId: colors[0]?.id ?? "",
      enhancementId: enhancements[0]?.id ?? "",
    },
    {
      id: "modelo-2",
      label: second,
      description: "EquilÃ­brio entre presenÃ§a visual e custo operacional.",
      formatId: formats[2]?.id ?? formats[1].id,
      material: premiumMaterial,
      finishing: refinedFinishing,
      colorId: colors[1]?.id ?? "",
      enhancementId: enhancements[1]?.id ?? enhancements[0]?.id ?? "",
    },
    {
      id: "modelo-3",
      label: third,
      description: "ConfiguraÃ§Ã£o premium para peÃ§as com mais presenÃ§a.",
      formatId: formats[2]?.id ?? formats[1].id,
      material: topMaterial,
      finishing: premiumFinishing,
      colorId: colors[2]?.id ?? colors[0]?.id ?? "",
      enhancementId: enhancements[2]?.id ?? enhancements[0]?.id ?? "",
    },
  ];
}

function buildQuantityTiers(product: Product) {
  const baseTiers = [1, 10, 25, 50, 100];
  const minimum = Math.max(product.minQuantity, 1);
  return Array.from(new Set([minimum, ...baseTiers])).sort((a, b) => a - b);
}

function inferKindLabel(kind: string) {
  switch (kind) {
    case "adhesive":
      return "ComunicaÃ§Ã£o aplicada";
    case "card":
      return "Institucional premium";
    case "rigid":
      return "RÃ­gidos e fachadas";
    case "vertical":
      return "Eventos e ativaÃ§Ãµes";
    default:
      return "Grande formato";
  }
}

function isStoreBackedActiveProduct(product: Product): product is ActiveProduct {
  return "storeProductId" in product && Boolean((product as ActiveProduct).storeProductId);
}

/**
 * Monta a experiÃªncia do configurador. Produtos de `store_products` **sempre** usam a experiÃªncia
 * persistida no payload (mapa `storeExperienceBySlug` ou, em Ãºltimo caso, `storeExperience` no objeto).
 */
export function buildProductExperience(product: Product): ProductExperience {
  const storeKey = product.slug.trim().toLowerCase();
  const stored = storeExperienceBySlug.get(storeKey);
  if (stored) {
    return stored;
  }

  if (isStoreBackedActiveProduct(product) && product.storeExperience) {
    return product.storeExperience;
  }

  const config = getProductConfiguration(product.slug);

  if (config) {
    return {
      rating: {
        value: product.featured ? 4.9 : 4.8,
        reviews: product.featured ? 126 : 89,
        caption: `${inferKindLabel(inferVisualKind(product))} com operaÃ§Ã£o pronta para fechamento`,
      },
      gallery: config.images,
      models: config.configurator.model,
      formats: config.configurator.format,
      colors: config.configurator.color,
      enhancements: config.configurator.enhancement,
      addons: config.services,
      specs: config.technicalSpecs,
      downloads: buildDownloads(product),
      shipping: {
        placeholder: "Use o CEP do destino para estimar entrega, retirada ou logÃ­stica regional.",
        note: "A estimativa combina regiÃ£o do CEP e volume atual do pedido para orientar o fechamento.",
      },
      quantityTiers: config.priceTable.map((row) => row.quantity),
    };
  }

  const kind = inferVisualKind(product);
  const formats = buildFormats(product);
  const colors = buildColors(product);
  const enhancements = buildEnhancements(product);
  const models = buildModels(product, formats, colors, enhancements);

  return {
    rating: {
      value: product.featured ? 4.9 : 4.8,
      reviews: product.featured ? 126 : 89,
      caption: `${inferKindLabel(kind)} com operaÃ§Ã£o pronta para fechamento`,
    },
    gallery: galleryCopy(product, kind),
    models,
    formats,
    colors,
    enhancements,
    addons: buildAddons(),
    specs: buildSpecs(product),
    downloads: buildDownloads(product),
    shipping: {
      placeholder: "Use o CEP do destino para estimar entrega, retirada ou logÃ­stica regional.",
      note: "A estimativa combina regiÃ£o do CEP e volume atual do pedido para orientar o fechamento.",
    },
    quantityTiers: buildQuantityTiers(product),
  };
}

/** ExperiÃªncia para produtos cadastrados via admin (sem `productConfigurations` estÃ¡tico). */
export function buildStoreProductExperienceFromProduct(
  product: Product,
  overrides: {
    gallery: ProductGalleryItem[];
    formats: ProductFormatOption[];
    addons: ProductAddonService[];
  },
): ProductExperience {
  const kind = inferVisualKind(product);
  const colors = buildColors(product);
  const enhancements = buildEnhancements(product);
  const models = buildModels(product, overrides.formats, colors, enhancements);

  return {
    rating: {
      value: product.featured ? 4.9 : 4.8,
      reviews: product.featured ? 126 : 89,
      caption: `${inferKindLabel(kind)} com operaÃ§Ã£o pronta para fechamento`,
    },
    gallery: overrides.gallery,
    models,
    formats: overrides.formats,
    colors,
    enhancements,
    addons: overrides.addons,
    specs: buildSpecs(product),
    downloads: buildDownloads(product),
    shipping: {
      placeholder: "Use o CEP do destino para estimar entrega, retirada ou logÃ­stica regional.",
      note: "A estimativa combina regiÃ£o do CEP e volume atual do pedido para orientar o fechamento.",
    },
    quantityTiers: buildQuantityTiers(product),
  };
}

export function getProductExperience(slug: string) {
  const active = getActiveProductSnapshotBySlug(slug);
  if (!active) {
    return null;
  }

  return buildProductExperience(active);
}

export function getDefaultSelection(product: Product, experience: ProductExperience): ProductSelectionState {
  const model = experience.models[0];
  const format = experience.formats.find((item) => item.id === model?.formatId) ?? experience.formats[0];

  return {
    modelId: model?.id ?? "",
    formatId: format?.id ?? "",
    width: format?.width ?? getDefaultMeasuresForProduct(product).width,
    height: format?.height ?? getDefaultMeasuresForProduct(product).height,
    customSizeUnit: "cm",
    colorId: model?.colorId ?? experience.colors[0]?.id ?? "",
    enhancementId: model?.enhancementId ?? experience.enhancements[0]?.id ?? "",
    material: model?.material ?? product.materials[0]?.label ?? "",
    finishing: model?.finishing ?? product.finishings[0]?.label ?? "",
    deadline: getPreferredDeadlineLabel(product),
    quantity: product.minQuantity,
    selectedAddonIds: [],
  };
}

export function getSelectedFormat(experience: ProductExperience, selection: ProductSelectionState): ProductFormatOption {
  if (selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID) {
    return {
      id: PRISMARQ_CUSTOM_FORMAT_ID,
      label: "Tamanho personalizado",
      description: "",
      width: selection.width,
      height: selection.height,
    };
  }
  return experience.formats.find((item) => item.id === selection.formatId) ?? experience.formats[0];
}

export function getSelectedModel(experience: ProductExperience, selection: ProductSelectionState) {
  return experience.models.find((item) => item.id === selection.modelId) ?? experience.models[0];
}

export function getSelectedColor(experience: ProductExperience, selection: ProductSelectionState) {
  return experience.colors.find((item) => item.id === selection.colorId) ?? experience.colors[0];
}

export function getSelectedEnhancement(experience: ProductExperience, selection: ProductSelectionState) {
  return experience.enhancements.find((item) => item.id === selection.enhancementId) ?? experience.enhancements[0];
}

export function getSelectedAddons(experience: ProductExperience, selection: ProductSelectionState) {
  return experience.addons.filter((item) => selection.selectedAddonIds.includes(item.id));
}

export function buildSelectionNotes(product: Product, experience: ProductExperience, selection: ProductSelectionState) {
  const model = getSelectedModel(experience, selection);
  const format = getSelectedFormat(experience, selection);
  const color = getSelectedColor(experience, selection);
  const enhancement = getSelectedEnhancement(experience, selection);
  const addons = getSelectedAddons(experience, selection);

  const formatLine =
    selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID
      ? formatCustomSizeLabel(selection)
      : `Formato: ${format.label} (${selection.width} x ${selection.height} cm)`;

  return [
    `Modelo: ${model.label}`,
    formatLine,
    `Cor: ${color.label}`,
    `Enobrecimento: ${enhancement.label}`,
    `Material: ${selection.material}`,
    `Acabamento: ${selection.finishing}`,
    `Prazo: ${selection.deadline}`,
    addons.length > 0 ? `ServiÃ§os adicionais: ${addons.map((item) => item.label).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrderUrl(product: Product, experience: ProductExperience, selection: ProductSelectionState) {
  const params = new URLSearchParams();
  params.set("product", product.slug);
  params.set("width", String(selection.width));
  params.set("height", String(selection.height));
  if (selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID) {
    params.set("formatId", PRISMARQ_CUSTOM_FORMAT_ID);
    params.set("customSizeUnit", normalizeCustomSizeUnit(selection.customSizeUnit));
  }
  params.set("quantity", String(selection.quantity));
  params.set("material", selection.material);
  params.set("finishing", selection.finishing);
  params.set("deadline", selection.deadline);
  params.set("notes", buildSelectionNotes(product, experience, selection));
  return `/order?${params.toString()}`;
}

export function formatSelectionLabel(experience: ProductExperience, selection: ProductSelectionState) {
  const model = getSelectedModel(experience, selection);
  const format = getSelectedFormat(experience, selection);
  const color = getSelectedColor(experience, selection);
  const enhancement = getSelectedEnhancement(experience, selection);

  const formatSummary =
    selection.formatId === PRISMARQ_CUSTOM_FORMAT_ID
      ? formatCustomSizeLabel(selection)
      : `${format.label} · ${selection.width} x ${selection.height} cm`;

  return {
    model: model.label,
    format: formatSummary,
    color: color.label,
    enhancement: enhancement.label,
  };
}


