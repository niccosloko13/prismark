import type {
  Product,
  ProductAdditionalService,
  ProductConfiguration,
  ProductGalleryImage,
  ProductPriceTier,
  ProductTechnicalSpec,
} from "@/types";
import { getDefaultMeasuresForProduct, getPreferredDeadlineLabel } from "@/lib/order-presets";
import { getProductImagePaths } from "@/lib/product-images";
import { roundTo } from "@/lib/utils";

type ProductKind = "large" | "adhesive" | "card" | "rigid" | "vertical";
type GalleryNarrative = {
  title: string;
  subtitle: string;
  caption: string;
};

const accentSets: Record<
  ProductKind,
  ["cyan", "magenta", "yellow"] | ["cyan", "yellow", "magenta"] | ["yellow", "cyan", "magenta"]
> = {
  large: ["cyan", "magenta", "yellow"],
  adhesive: ["cyan", "yellow", "magenta"],
  card: ["yellow", "cyan", "magenta"],
  rigid: ["cyan", "yellow", "magenta"],
  vertical: ["yellow", "cyan", "magenta"],
};

const galleryCopyByKind: Record<ProductKind, GalleryNarrative[]> = {
  large: [
    {
      title: "Aplicação em fachada",
      subtitle: "Leitura forte para {application} com mais presença comercial.",
      caption: "{product} apresentado em um contexto real de campanha, venda ou sinalização.",
    },
    {
      title: "Close de acabamento",
      subtitle: "Material e finalização pensados para {material}.",
      caption: "Detalhes visuais reforçam acabamento, montagem e percepção de valor na peça.",
    },
    {
      title: "Peça em operação",
      subtitle: "Uso real no ponto de contato e leitura frontal mais limpa.",
      caption: "A galeria mostra como o produto funciona em loja, evento, vitrine ou ativação.",
    },
    {
      title: "Mockup comercial",
      subtitle: "Prévia visual da peça pronta para aprovação e fechamento.",
      caption: "Mockup da Prismarq para apoiar decisão de compra, aprovação interna e venda consultiva.",
    },
  ],
  adhesive: [
    {
      title: "Aplicação em vitrine",
      subtitle: "Visual aderido com leitura clara para {application}.",
      caption: "{product} em contexto comercial para demonstrar visibilidade, cobertura e recorte.",
    },
    {
      title: "Recorte e laminação",
      subtitle: "Proteção pensada para {material} e uso diário.",
      caption: "A peça valoriza acabamento, proteção de superfície e durabilidade em operação.",
    },
    {
      title: "Vidro em uso real",
      subtitle: "Leitura controlada para fachada, PDV e ambientação.",
      caption: "Exemplo visual para loja, porta de entrada, vitrine ou comunicação aplicada.",
    },
    {
      title: "Mockup de instalação",
      subtitle: "Prévia comercial com foco em aprovação e aplicação.",
      caption: "Mockup produzido para reforçar percepção de valor antes da instalação final.",
    },
  ],
  card: [
    {
      title: "Apresentação em bancada",
      subtitle: "{product} com leitura mais clara e comercial.",
      caption: "A peça aparece como produto pronto para networking, balcão, ação promocional ou apresentação.",
    },
    {
      title: "Papel e acabamento",
      subtitle: "Superfície valorizada para {material} e impressão premium.",
      caption: "Close visual para reforçar textura, acabamento e valor percebido da papelaria.",
    },
    {
      title: "Lote em distribuição",
      subtitle: "Organização para {application} com leitura objetiva.",
      caption: "Mostra a peça pronta para distribuição, entrega em balcão ou uso institucional.",
    },
    {
      title: "Mockup editorial",
      subtitle: "Prévia da arte aplicada para aprovação comercial.",
      caption: "Mockup da peça com enquadramento mais premium para apoiar a decisão de compra.",
    },
  ],
  rigid: [
    {
      title: "Presença em fachada",
      subtitle: "{product} com mais corpo visual para {application}.",
      caption: "Aplicação comercial que reforça leitura, robustez e identidade de marca no espaço.",
    },
    {
      title: "Fixação e estrutura",
      subtitle: "Detalhes técnicos de montagem para {material}.",
      caption: "A galeria destaca base, fixação, recorte e acabamento do produto rígido.",
    },
    {
      title: "Display em operação",
      subtitle: "Uso real em parede, piso, entrada ou ponto de exposição.",
      caption: "Exemplo visual pensado para venda consultiva e comparação entre acabamentos.",
    },
    {
      title: "Mockup arquitetônico",
      subtitle: "Prévia premium para aprovação, obra ou retrofit comercial.",
      caption: "Mockup técnico-comercial para apresentar a solução antes da produção final.",
    },
  ],
  vertical: [
    {
      title: "Ativação em evento",
      subtitle: "Mais visibilidade para {application} em área de fluxo.",
      caption: "O produto aparece em contexto real de evento, recepção, praça ou ativação promocional.",
    },
    {
      title: "Base e costura",
      subtitle: "Estrutura pronta para montagem com {material}.",
      caption: "A leitura valoriza base, costura, haste e estabilidade da peça em operação.",
    },
    {
      title: "Leitura a distância",
      subtitle: "Formato vertical com impacto rápido e comercial.",
      caption: "Ideal para destacar campanhas, entrada de loja, feiras e comunicação promocional.",
    },
    {
      title: "Mockup promocional",
      subtitle: "Prévia comercial da peça montada para aprovação.",
      caption: "Mockup final pensado para acelerar fechamento e aprovação do layout.",
    },
  ],
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fillForAccent(accent: string) {
  if (accent === "cyan") return "#00B5FF";
  if (accent === "magenta") return "#FF2EBF";
  return "#FFD300";
}

function inferKind(product: Product): ProductKind {
  if (product.slug === "adesivo" || product.slug === "adesivo-perfurado") return "adhesive";
  if (["cartao", "folheto", "folder"].includes(product.slug)) return "card";
  if (product.slug === "wind-banner") return "vertical";
  if (product.slug.startsWith("placa") || product.slug === "totem") return "rigid";
  return "large";
}

function paletteFor(product: Product) {
  return accentSets[inferKind(product)];
}

function fillNarrative(template: string, product: Product, index: number) {
  const application = product.applications[index % Math.max(product.applications.length, 1)] ?? product.category;
  const material = product.materials[index % Math.max(product.materials.length, 1)]?.label ?? product.category;

  return template
    .replaceAll("{product}", product.name)
    .replaceAll("{application}", application)
    .replaceAll("{material}", material);
}

function buildGalleryCopies(product: Product, kind: ProductKind, count: number) {
  const narratives = galleryCopyByKind[kind];

  return Array.from({ length: count }, (_, index) => {
    const narrative = narratives[index % narratives.length];
    const application = product.applications[index % Math.max(product.applications.length, 1)] ?? product.category;
    const material = product.materials[index % Math.max(product.materials.length, 1)]?.label ?? product.category;

    return {
      title: fillNarrative(narrative.title, product, index),
      subtitle: fillNarrative(narrative.subtitle, product, index),
      caption: fillNarrative(narrative.caption, product, index),
      tags: [product.category, application, material].filter(Boolean).slice(0, 3),
    };
  });
}

function createArtworkSvg(product: Product, variant: number): string {
  const kind = inferKind(product);
  const palette = paletteFor(product);
  const primary = fillForAccent(palette[variant % palette.length]);
  const tertiary = fillForAccent(palette[(variant + 2) % palette.length]);
  const measures = getDefaultMeasuresForProduct(product);
  const copy = buildGalleryCopies(product, kind, 4)[variant % 4];

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" fill="none">
      <defs>
        <linearGradient id="bg" x1="140" y1="120" x2="1460" y2="1080" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${primary}" stop-opacity="0.96" />
          <stop offset="58%" stop-color="#111111" stop-opacity="0.94" />
          <stop offset="100%" stop-color="${tertiary}" stop-opacity="0.94" />
        </linearGradient>
        <linearGradient id="sheet" x1="220" y1="220" x2="1240" y2="860" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="rgba(255,255,255,0.88)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.18)" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1200" rx="80" fill="url(#bg)" />
      <path d="M0 880 C260 760, 460 860, 760 760 C1020 672, 1280 720, 1600 610 V1200 H0 Z" fill="rgba(255,255,255,0.06)" />
      <rect x="160" y="150" width="1280" height="760" rx="64" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" />
      <rect x="230" y="240" width="760" height="470" rx="44" fill="url(#sheet)" stroke="rgba(255,255,255,0.2)" />
      <path d="M280 670 L620 360 L910 470 L1220 280" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="1130" cy="650" r="120" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
      <rect x="96" y="92" width="220" height="52" rx="26" fill="rgba(15,15,15,0.28)" />
      <text x="128" y="126" fill="white" font-size="24" font-weight="700" letter-spacing="4">PRISMARQ</text>
      <text x="96" y="1016" fill="white" font-size="68" font-weight="800" font-family="Aptos, Segoe UI, sans-serif">${escapeXml(product.name)}</text>
      <text x="96" y="1076" fill="rgba(255,255,255,0.78)" font-size="30" font-weight="500" font-family="Aptos, Segoe UI, sans-serif">${escapeXml(product.category)} · ${measures.width} x ${measures.height} cm</text>
      <text x="96" y="1130" fill="rgba(255,255,255,0.82)" font-size="24" font-weight="500" font-family="Aptos, Segoe UI, sans-serif">${escapeXml(copy.subtitle)}</text>
      <g opacity="0.92">
        <rect x="1080" y="92" width="340" height="52" rx="26" fill="rgba(255,255,255,0.12)" />
        <text x="1120" y="126" fill="white" font-size="22" font-weight="700" letter-spacing="2">${escapeXml(copy.title.toUpperCase())}</text>
      </g>
    </svg>
  `)}`;
}

function calculateReferenceQuote(
  product: Product,
  width: number,
  height: number,
  quantity: number,
  materialLabel: string,
  finishingLabel: string,
  deadlineLabel: string,
) {
  const area = roundTo((width / 100) * (height / 100), 4);
  const billableArea = Math.max(area, product.minimumArea);
  const material = product.materials.find((item) => item.label === materialLabel) ?? product.materials[0];
  const finishing = product.finishings.find((item) => item.label === finishingLabel) ?? product.finishings[0];
  const deadline = product.deadlines.find((item) => item.label === deadlineLabel) ?? product.deadlines[0];

  const pricePerM2 = roundTo(product.basePriceM2 * material.multiplier);
  const unitBase = roundTo(pricePerM2 * billableArea);
  const subtotal = roundTo(unitBase * quantity);
  const finishingFee = roundTo(finishing.type === "perUnit" ? finishing.fee * quantity : finishing.fee);
  const total = roundTo((subtotal + finishingFee) * deadline.multiplier);

  return { total };
}

function buildQuantitySteps(product: Product) {
  switch (product.slug) {
    case "folheto":
      return [1000, 2500, 5000, 10000, 20000];
    case "folder":
      return [500, 1000, 2500, 5000, 10000];
    case "cartao":
      return [100, 250, 500, 1000, 2500];
    case "banner":
      return [1, 5, 10, 30, 50];
    case "totem":
      return [1, 5, 10, 50, 100];
    case "wind-banner":
      return [1, 2, 5, 10, 20];
    default:
      return [product.minQuantity, 5, 10, 25, 50].filter((quantity) => quantity >= product.minQuantity);
  }
}

function buildPriceTable(product: Product): ProductPriceTier[] {
  const measures = getDefaultMeasuresForProduct(product);
  const deadlineLabel = getPreferredDeadlineLabel(product);
  const quantities = Array.from(new Set(buildQuantitySteps(product))).sort((a, b) => a - b);

  return quantities.map((quantity, index) => {
    const quote = calculateReferenceQuote(
      product,
      measures.width,
      measures.height,
      quantity,
      product.materials[0]?.label ?? "",
      product.finishings[0]?.label ?? "",
      deadlineLabel,
    );

    return {
      quantity,
      unitPrice: roundTo(quote.total / quantity),
      total: quote.total,
      highlighted: quantity === product.minQuantity || index === 1,
    };
  });
}

function buildCmykSwatch(palette: readonly string[]) {
  return palette[0] === "cyan"
    ? "linear-gradient(135deg, #00B5FF 0%, #FF2EBF 55%, #FFD300 100%)"
    : palette[0] === "yellow"
      ? "linear-gradient(135deg, #FFD300 0%, #00B5FF 52%, #FF2EBF 100%)"
      : "linear-gradient(135deg, #FF2EBF 0%, #00B5FF 52%, #FFD300 100%)";
}

function buildFormats(product: Product) {
  const measures = getDefaultMeasuresForProduct(product);

  switch (product.slug) {
    case "banner":
      return [
        { id: "compacto", label: "600 x 900 mm", description: "Formato ágil para balcão, loja e campanha enxuta.", width: 60, height: 90 },
        { id: "padrao", label: "1000 x 1500 mm", description: "Formato principal para promoções, eventos e PDV.", width: 100, height: 150, recommended: true },
        { id: "impacto", label: "1000 x 2000 mm", description: "Mais altura e presença para recepção e circulação.", width: 100, height: 200 },
      ];
    case "backdrop":
      return [
        { id: "compacto", label: "2000 x 2000 mm", description: "Boa medida para cenário de foto e evento menor.", width: 200, height: 200 },
        { id: "padrao", label: "3000 x 2500 mm", description: "Formato comercial para estande, palco e patrocinadores.", width: 300, height: 250, recommended: true },
        { id: "impacto", label: "3000 x 3000 mm", description: "Cobertura maior para painéis de fundo e coletivas.", width: 300, height: 300 },
      ];
    case "banner-tecido":
      return [
        { id: "compacto", label: "700 x 1000 mm", description: "Peça leve para balcão, recepção e exposição rápida.", width: 70, height: 100 },
        { id: "padrao", label: "1000 x 1500 mm", description: "Equilíbrio entre leitura, leveza e transporte.", width: 100, height: 150, recommended: true },
        { id: "impacto", label: "1400 x 3000 mm", description: "Mais presença para cenografia e fundo de palco.", width: 140, height: 300 },
      ];
    case "folheto":
      return [
        { id: "compacto", label: "100 x 140 mm", description: "Formato ágil para panfletagem e oferta rápida.", width: 10, height: 14, recommended: true },
        { id: "padrao", label: "150 x 210 mm", description: "Mais espaço para cardápio, menu e campanha local.", width: 15, height: 21 },
        { id: "impacto", label: "200 x 300 mm", description: "Área maior para comunicação visual e texto.", width: 20, height: 30 },
      ];
    case "folder":
      return [
        { id: "compacto", label: "140 x 100 mm", description: "Fechado compacto para balcão e visita comercial.", width: 14, height: 10 },
        { id: "padrao", label: "200 x 140 mm", description: "Formato comercial mais equilibrado para duas dobras.", width: 20, height: 14, recommended: true },
        { id: "impacto", label: "280 x 200 mm", description: "Mais área para institucional, cardápio e apresentação.", width: 28, height: 20 },
      ];
    case "adesivo-perfurado":
      return [
        { id: "compacto", label: "330 x 770 mm", description: "Aplicação menor para porta de vidro e vitrine local.", width: 33, height: 77 },
        { id: "padrao", label: "1000 x 1000 mm", description: "Formato versátil para vidro, vitrine e fachada.", width: 100, height: 100, recommended: true },
        { id: "impacto", label: "1400 x 2000 mm", description: "Cobertura ampla para áreas maiores de vidro.", width: 140, height: 200 },
      ];
    case "totem":
      return [
        { id: "compacto", label: "300 x 1500 mm", description: "Modelo slim para piso e corredores mais enxutos.", width: 30, height: 150 },
        { id: "padrao", label: "390 x 1950 mm", description: "Formato triedro para varejo, feira e ativação.", width: 39, height: 195, recommended: true },
        { id: "impacto", label: "450 x 1800 mm", description: "Mais base visual para entrada, vitrine e exposição.", width: 45, height: 180 },
      ];
    case "faixa-impressa":
      return [
        { id: "compacto", label: "2000 x 700 mm", description: "Faixa rápida para fachada menor e ação local.", width: 200, height: 70 },
        { id: "padrao", label: "4000 x 800 mm", description: "Formato principal para inauguração, saldo e rua.", width: 400, height: 80, recommended: true },
        { id: "impacto", label: "6000 x 1000 mm", description: "Mais metragem para campanha externa com grande leitura.", width: 600, height: 100 },
      ];
    case "wind-banner":
      return [
        { id: "compacto", label: "650 x 1700 mm", description: "Boa relação entre mobilidade e visibilidade.", width: 65, height: 170 },
        { id: "padrao", label: "750 x 2000 mm", description: "Formato principal para posto, evento e frente de loja.", width: 75, height: 200, recommended: true },
        { id: "impacto", label: "850 x 2300 mm", description: "Mais leitura para área aberta e fluxo intenso.", width: 85, height: 230 },
      ];
    default:
      return [
        {
          id: "compacto",
          label: "Compacto",
          description: "Entrega mais enxuta com foco em economia e agilidade.",
          width: Math.max(1, Math.round(measures.width * 0.82)),
          height: Math.max(1, Math.round(measures.height * 0.82)),
        },
        {
          id: "padrao",
          label: "Padrão",
          description: "Formato principal recomendado para o fluxo comercial.",
          width: measures.width,
          height: measures.height,
          recommended: true,
        },
        {
          id: "impacto",
          label: "Impacto",
          description: "Maior área visual para campanhas, fachadas e ativações.",
          width: Math.max(1, Math.round(measures.width * 1.2)),
          height: Math.max(1, Math.round(measures.height * 1.2)),
        },
      ];
  }
}

function buildColors(product: Product, palette: readonly string[]) {
  const cmykSwatch = buildCmykSwatch(palette);

  switch (product.slug) {
    case "folheto":
      return [
        { id: "4x0", label: "4x0 · Colorido frente", description: "Entrada mais usada para panfletagem e oferta.", swatch: cmykSwatch },
        { id: "4x4", label: "4x4 · Frente e verso", description: "Aproveita os dois lados para mais argumento comercial.", swatch: "linear-gradient(135deg, #00B5FF 0%, #ffffff 50%, #FF2EBF 100%)" },
        { id: "1x0", label: "1x0 · Preto frente", description: "Alternativa econômica para comunicado objetivo.", swatch: "linear-gradient(135deg, #0f0f0f 0%, #646464 100%)" },
      ];
    case "folder":
      return [
        { id: "4x4", label: "4x4 · Frente e verso", description: "Padrão principal para leitura completa do folder.", swatch: cmykSwatch },
        { id: "4x0", label: "4x0 · Frente colorida", description: "Fluxo econômico para conteúdo concentrado na capa.", swatch: "linear-gradient(135deg, #0f0f0f 0%, #00B5FF 100%)" },
        { id: "4x4-premium", label: "4x4 · Alta cobertura", description: "Mais presença visual para apresentação institucional.", swatch: "linear-gradient(135deg, #FFD300 0%, #FF2EBF 50%, #00B5FF 100%)" },
      ];
    case "adesivo":
    case "adesivo-perfurado":
      return [
        { id: "4x0", label: "4x0 · Colorido frente", description: "Leitura externa com produção direta e objetiva.", swatch: cmykSwatch },
        { id: "4x0-branco", label: "4x0 · Com apoio de branco", description: "Ajuda na leitura em bases transparentes ou mistas.", swatch: "linear-gradient(135deg, #ffffff 0%, #00B5FF 40%, #FF2EBF 100%)" },
        { id: "alta-cobertura", label: "Alta cobertura", description: "Mais presença de cor para vidro e fachada iluminada.", swatch: "linear-gradient(135deg, #0f0f0f 0%, #00B5FF 50%, #FFD300 100%)" },
      ];
    case "placa-pvc":
    case "placa-acm":
    case "totem":
      return [
        { id: "4x0", label: "4x0 · Frente colorida", description: "Face principal com comunicação mais forte.", swatch: cmykSwatch },
        { id: "4x4", label: "4x4 · Frente e verso", description: "Útil para peças centrais ou leitura nos dois lados.", swatch: "linear-gradient(135deg, #00B5FF 0%, #ffffff 50%, #FF2EBF 100%)" },
        { id: "institucional", label: "Institucional", description: "Base sóbria para marca, orientação e sinalização.", swatch: "linear-gradient(135deg, #0f0f0f 0%, #525252 100%)" },
      ];
    default:
      return [
        { id: "4x0", label: "4x0 · Colorido frente", description: "Configuração principal para comunicação promocional.", swatch: cmykSwatch },
        { id: "4x4", label: "4x4 · Frente e verso", description: "Expande leitura para estruturas e peças premium.", swatch: "linear-gradient(135deg, #00B5FF 0%, #ffffff 50%, #FF2EBF 100%)" },
        { id: "alta-cobertura", label: "Alta cobertura", description: "Mais presença de cor para campanhas de impacto.", swatch: "linear-gradient(135deg, #FFD300 0%, #00B5FF 45%, #FF2EBF 100%)" },
      ];
  }
}

function buildEnhancements(product: Product, kind: ProductKind) {
  switch (product.slug) {
    case "banner-tecido":
      return [
        { id: "sublimacao", label: "Impressão sublimática", description: "Transferência principal para tecido leve e vibrante.", priceLabel: "Incluso" },
        { id: "ultra-hd", label: "Ultra HD sublimática", description: "Melhora nitidez para cenografia, foto e marca.", priceLabel: "sob consulta" },
        { id: "dupla-face", label: "Dupla leitura", description: "Solução para visualização em ambos os lados da peça.", priceLabel: "sob consulta" },
      ];
    case "folheto":
      return [
        { id: "sem", label: "Sem enobrecimento", description: "Produção direta para grande volume.", priceLabel: "Incluso" },
        { id: "verniz-total", label: "Verniz total", description: "Realça cor e valor percebido da campanha.", priceLabel: "sob consulta" },
        { id: "bopp", label: "BOPP fosco", description: "Proteção extra para ações mais longas ou seletivas.", priceLabel: "sob consulta" },
      ];
    case "folder":
      return [
        { id: "sem", label: "Sem enobrecimento", description: "Fluxo comercial direto para apresentação dobrada.", priceLabel: "Incluso" },
        { id: "verniz-total", label: "Verniz total brilho", description: "Mais contraste e apelo comercial na capa.", priceLabel: "sob consulta" },
        { id: "bopp", label: "Laminação fosca", description: "Mais percepção premium em material institucional.", priceLabel: "sob consulta" },
      ];
    case "adesivo-perfurado":
      return [
        { id: "sem", label: "Sem enobrecimento", description: "Produção direta para aplicação em vidro.", priceLabel: "Incluso" },
        { id: "uv", label: "Laminação UV", description: "Aumenta proteção para uso externo contínuo.", priceLabel: "sob consulta" },
        { id: "instalacao", label: "Máscara de aplicação", description: "Facilita instalação mais precisa em áreas amplas.", priceLabel: "sob consulta" },
      ];
    case "totem":
      return [
        { id: "sem", label: "Sem enobrecimento", description: "Fluxo direto para exposição de chão.", priceLabel: "Incluso" },
        { id: "vinco", label: "Vinco guiado", description: "Melhora montagem e estabilidade na abertura.", priceLabel: "sob consulta" },
        { id: "protecao", label: "Proteção de base", description: "Reforça a peça para evento e uso recorrente.", priceLabel: "sob consulta" },
      ];
    default:
      return kind === "card"
        ? [
            { id: "sem", label: "Sem enobrecimento", description: "Produção enxuta para prazo rápido.", priceLabel: "Incluso" },
            { id: "laminacao", label: "Laminação fosca", description: "Toque premium e proteção adicional.", priceLabel: "sob consulta" },
            { id: "verniz", label: "Verniz local UV", description: "Realce de marca e pontos de destaque.", priceLabel: "sob consulta" },
          ]
        : [
            { id: "sem", label: "Sem enobrecimento", description: "Fluxo direto para peças comerciais e táticas.", priceLabel: "Incluso" },
            { id: "laminacao", label: "Laminação fosca", description: "Proteção e acabamento elegante.", priceLabel: "sob consulta" },
            { id: "verniz", label: "Verniz UV", description: "Destaque para identidade e textos-chave.", priceLabel: "sob consulta" },
          ];
  }
}

function buildModelBlueprints(product: Product) {
  switch (product.slug) {
    case "backdrop":
      return [
        { label: "Cenário fotográfico", description: "Pensado para logos repetidos, foto e vídeo em eventos.", formatIndex: 1, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Coletiva e palco", description: "Mais área útil e montagem mais limpa para palco ou estande.", formatIndex: 2, materialIndex: 1, finishingIndex: 1, colorIndex: 0, enhancementIndex: 1 },
        { label: "Backdrop premium", description: "Configuração mais robusta para reaproveitamento e presença de marca.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
    case "banner":
      return [
        { label: "Loja e balcão", description: "Formato clássico para ofertas, vitrine e campanha rápida.", formatIndex: 0, materialIndex: 0, finishingIndex: 1, colorIndex: 0, enhancementIndex: 0 },
        { label: "Evento", description: "Equilíbrio entre leitura, custo e acabamento pronto para uso.", formatIndex: 1, materialIndex: 0, finishingIndex: 1, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Impacto vertical", description: "Mais altura visual para recepção, auditório e circulação.", formatIndex: 2, materialIndex: 2, finishingIndex: 0, colorIndex: 2, enhancementIndex: 1 },
      ];
    case "banner-tecido":
      return [
        { label: "Display leve", description: "Banner mais leve para balcão, loja e ação sazonal.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0 },
        { label: "Evento interno", description: "Formato principal para feiras, recepções e cenografia.", formatIndex: 1, materialIndex: 1, finishingIndex: 1, colorIndex: 0, enhancementIndex: 1, recommended: true },
        { label: "Cenário premium", description: "Mais área e tecido com mais corpo para palco e fundo visual.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
    case "folheto":
      return [
        { label: "Distribuição rápida", description: "Pensado para panfletagem com alto volume e custo competitivo.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Campanha local", description: "Mais espaço para oferta, cardápio e prova comercial.", formatIndex: 1, materialIndex: 1, finishingIndex: 1, colorIndex: 1, enhancementIndex: 1 },
        { label: "Ação premium", description: "Combina formato maior com papel mais encorpado para distribuição seletiva.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
    case "folder":
      return [
        { label: "Institucional", description: "Apresentação dobrada com leitura clara para equipe comercial.", formatIndex: 1, materialIndex: 1, finishingIndex: 1, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Sanfona promocional", description: "Melhor para narrativa em sequência e campanha de balcão.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 1, enhancementIndex: 1 },
        { label: "Carteira premium", description: "Mais área, mais corpo e acabamento pensado para apresentação.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
    case "adesivo-perfurado":
      return [
        { label: "Vitrine", description: "Ideal para vidro frontal com comunicação promocional direta.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0 },
        { label: "Fachada de vidro", description: "Mais cobertura e leitura para painéis envidraçados.", formatIndex: 1, materialIndex: 1, finishingIndex: 1, colorIndex: 1, enhancementIndex: 1, recommended: true },
        { label: "Aplicação ampla", description: "Formato e proteção pensados para áreas maiores e externas.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
    case "totem":
      return [
        { label: "Slim", description: "Modelo mais enxuto para piso e informação pontual.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0 },
        { label: "Triedro", description: "Formato principal para evento, varejo e ação promocional.", formatIndex: 1, materialIndex: 0, finishingIndex: 1, colorIndex: 0, enhancementIndex: 1, recommended: true },
        { label: "Autoportante premium", description: "Mais presença visual e estabilidade para áreas centrais.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
    case "faixa-impressa":
      return [
        { label: "Rua rápida", description: "Mensagem direta para promoção local e fachada menor.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0 },
        { label: "Fachada comercial", description: "Configuração principal para inauguração, saldo e ofertas.", formatIndex: 1, materialIndex: 1, finishingIndex: 1, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Impacto externo", description: "Mais metragem e reforço para campanha de rua mais ampla.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 1 },
      ];
    case "wind-banner":
      return [
        { label: "Pena", description: "Leitura vertical clássica para postos, feiras e entrada de loja.", formatIndex: 0, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0 },
        { label: "Gota", description: "Modelo mais equilibrado para evento e circulação externa.", formatIndex: 1, materialIndex: 1, finishingIndex: 1, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Kit premium", description: "Maior presença com base mais forte para uso mais intenso.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 1 },
      ];
    default:
      return [
        { label: "Essencial", description: "Fluxo direto com foco em velocidade de produção.", formatIndex: 1, materialIndex: 0, finishingIndex: 0, colorIndex: 0, enhancementIndex: 0, recommended: true },
        { label: "Impacto", description: "Equilíbrio entre presença visual e custo operacional.", formatIndex: 2, materialIndex: 1, finishingIndex: 1, colorIndex: 1, enhancementIndex: 1 },
        { label: "Premium", description: "Configuração para peças com mais presença e valor percebido.", formatIndex: 2, materialIndex: 2, finishingIndex: 2, colorIndex: 2, enhancementIndex: 2 },
      ];
  }
}

function buildModels(
  product: Product,
  formats: ReturnType<typeof buildFormats>,
  colors: ReturnType<typeof buildColors>,
  enhancements: ReturnType<typeof buildEnhancements>,
) {
  const blueprints = buildModelBlueprints(product);

  return blueprints.map((blueprint, index) => ({
    id: `modelo-${index + 1}`,
    label: blueprint.label,
    description: blueprint.description,
    recommended: blueprint.recommended,
    formatId: formats[blueprint.formatIndex]?.id ?? formats[0]?.id ?? "",
    material: product.materials[blueprint.materialIndex]?.label ?? product.materials[0]?.label ?? "",
    finishing: product.finishings[blueprint.finishingIndex]?.label ?? product.finishings[0]?.label ?? "",
    colorId: colors[blueprint.colorIndex]?.id ?? colors[0]?.id ?? "",
    enhancementId: enhancements[blueprint.enhancementIndex]?.id ?? enhancements[0]?.id ?? "",
  }));
}

function buildConfigurator(product: Product) {
  const kind = inferKind(product);
  const palette = paletteFor(product);
  const formats = buildFormats(product);
  const colors = buildColors(product, palette);
  const enhancements = buildEnhancements(product, kind);

  return {
    model: buildModels(product, formats, colors, enhancements),
    material: product.materials,
    format: formats,
    color: colors,
    enhancement: enhancements,
    finishing: product.finishings,
    deadline: product.deadlines,
  };
}

function buildServices(product: Product): ProductAdditionalService[] {
  const productSpecificService = {
    banner: {
      id: "bastao",
      label: "Montagem com bastão",
      description: "Preparação completa para pendurar assim que chegar.",
      priceLabel: "a partir de R$ 38",
      feeBrl: 38,
    },
    backdrop: {
      id: "estrutura",
      label: "Apoio de montagem",
      description: "Orientação e checklist para instalar o backdrop com mais segurança.",
      priceLabel: "a partir de R$ 69",
      feeBrl: 69,
    },
    "banner-tecido": {
      id: "embalagem",
      label: "Embalagem para transporte",
      description: "Proteção pensada para tecido com uso recorrente em eventos.",
      priceLabel: "a partir de R$ 24",
      feeBrl: 24,
    },
    folheto: {
      id: "serrilha",
      label: "Cupom serrilhado",
      description: "Transforma o folheto em peça promocional destacável.",
      priceLabel: "a partir de R$ 43",
      feeBrl: 43,
    },
    folder: {
      id: "vinco",
      label: "Dobras calibradas",
      description: "Ajuste de dobra para leitura e fechamento mais limpos.",
      priceLabel: "a partir de R$ 24",
      feeBrl: 24,
    },
    "adesivo-perfurado": {
      id: "aplicacao",
      label: "Aplicação assistida",
      description: "Checagem e preparação para aplicação em vidro com menos risco.",
      priceLabel: "a partir de R$ 84",
      feeBrl: 84,
    },
    totem: {
      id: "montagem",
      label: "Pré-montagem",
      description: "Peça preparada para ganhar tempo na ativação ou evento.",
      priceLabel: "a partir de R$ 58",
      feeBrl: 58,
    },
    "faixa-impressa": {
      id: "reforco",
      label: "Reforço de borda",
      description: "Mais segurança para fixação em áreas de vento ou rua.",
      priceLabel: "a partir de R$ 28",
      feeBrl: 28,
    },
    "wind-banner": {
      id: "base",
      label: "Estrutura completa",
      description: "Kit com base e haste para entrar em operação mais rápido.",
      priceLabel: "a partir de R$ 148",
      feeBrl: 148,
    },
  }[product.slug];

  return [
    {
      id: "arte",
      label: "Criação de arte",
      description: "Layout profissional desenvolvido pela equipe Prismarq.",
      priceLabel: "a partir de R$ 95",
      feeBrl: 95,
      highlighted: true,
    },
    {
      id: "checagem",
      label: "Checagem de arquivo",
      description: "Revisão técnica de sangria, margem, resolução e fechamento.",
      priceLabel: "a partir de R$ 35",
      feeBrl: 35,
    },
    productSpecificService ?? {
      id: "acabamento",
      label: "Acabamento extra",
      description: "Ajuste final para elevar a aplicação e a apresentação da peça.",
      priceLabel: "sob consulta",
      feeBrl: 0,
    },
  ];
}

function buildTechnicalSpecs(product: Product): ProductTechnicalSpec[] {
  const measures = getDefaultMeasuresForProduct(product);
  const categories = buildCategories(product);
  const slugSpecificSpecs: Record<string, Array<{ label: string; value: string }>> = {
    backdrop: [
      { label: "Uso recomendado", value: "Palco · estande · coletiva · photo opportunity" },
      { label: "Estrutura sugerida", value: "Grid, tubo metálico ou painel de fundo" },
    ],
    "banner-tecido": [
      { label: "Técnica principal", value: "Sublimação em tecido poliéster" },
      { label: "Perfil de uso", value: "Cenografia leve, evento e vitrine" },
    ],
    folheto: [
      { label: "Tiragem comercial", value: "Alta escala com foco em distribuição" },
      { label: "Fechamento", value: "Refile, serrilha e acabamentos promocionais" },
    ],
    folder: [
      { label: "Dobras disponíveis", value: "Sanfona · carteira · vinco reforçado" },
      { label: "Perfil de uso", value: "Institucional, balcão e apresentação comercial" },
    ],
    "adesivo-perfurado": [
      { label: "Aplicação", value: "Vidro, vitrine e traseiro automotivo" },
      { label: "Leitura", value: "Visibilidade externa com visão interna parcial" },
    ],
    totem: [
      { label: "Estrutura", value: "Autoportante de piso com montagem dobrável" },
      { label: "Uso recomendado", value: "Varejo, eventos, corredores e entradas" },
    ],
    "faixa-impressa": [
      { label: "Metragem", value: "Indicada para larguras maiores e mensagem curta" },
      { label: "Instalação", value: "Fachada, rua e campanhas promocionais externas" },
    ],
    "wind-banner": [
      { label: "Kit", value: "Tecido, haste e base conforme acabamento escolhido" },
      { label: "Uso recomendado", value: "Postos, feiras, entradas e áreas abertas" },
    ],
  };

  return [
    { label: "Categoria", value: product.category },
    { label: "Categorias comerciais", value: categories.join(" · ") },
    { label: "Área mínima", value: `${product.minimumArea.toFixed(2)} m²` },
    { label: "Preço base", value: `${product.basePriceM2.toFixed(2)} por m²` },
    { label: "Dimensão padrão", value: `${measures.width} x ${measures.height} cm` },
    { label: "Materiais", value: product.materials.map((item) => item.label).join(" · ") },
    { label: "Acabamentos", value: product.finishings.map((item) => item.label).join(" · ") },
    { label: "Prazos", value: product.deadlines.map((item) => item.label).join(" · ") },
    ...(slugSpecificSpecs[product.slug] ?? []),
    { label: "Aplicações", value: product.applications.join(" · ") },
  ];
}

function buildCategories(product: Product): string[] {
  return Array.from(new Set([product.category, ...product.applications.slice(0, 3)]));
}

export function buildProductConfiguration(product: Product): ProductConfiguration {
  const imagePaths = getProductImagePaths(product.slug);
  const kind = inferKind(product);
  const palette = paletteFor(product);
  const galleryCount = Math.max(4, imagePaths.length, galleryCopyByKind[kind].length);
  const galleryCopies = buildGalleryCopies(product, kind, galleryCount);

  const images: ProductGalleryImage[] = galleryCopies.map((copy, index) => ({
    id: `${product.slug}-${index}`,
    title: copy.title,
    subtitle: copy.subtitle,
    caption: copy.caption,
    tags: copy.tags,
    accent: palette[index % palette.length],
    src: index < Math.min(imagePaths.length, Math.max(galleryCount - 1, 1)) ? imagePaths[index] : createArtworkSvg(product, index),
  }));

  return {
    categories: buildCategories(product),
    images,
    configurator: buildConfigurator(product),
    priceTable: buildPriceTable(product),
    services: buildServices(product),
    technicalSpecs: buildTechnicalSpecs(product),
  };
}
