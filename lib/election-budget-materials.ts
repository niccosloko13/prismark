import { companyLinks } from "@/lib/company";

export type ElectionMaterialId =
  | "santinho"
  | "santao"
  | "praguinha"
  | "pragao"
  | "bandeiras"
  | "folder"
  | "windbanner"
  | "banner_tecido"
  | "cartao_visita"
  | "adesivo_perfurado"
  | "adesivo_parachoque"
  | "jornal";

export type ElectionMaterialIcon =
  | "doc"
  | "banner"
  | "wide"
  | "post"
  | "wind"
  | "fabric"
  | "folder"
  | "card"
  | "perforated"
  | "bumper"
  | "flag"
  | "newspaper";

export type ElectionMaterialAccent =
  | "sky"
  | "amber"
  | "rose"
  | "blue"
  | "yellow"
  | "red"
  | "violet"
  | "orange";

export type QuoteFieldType = "qty_only" | "banner_dims";

export interface ElectionMaterialDefinition {
  id: ElectionMaterialId;
  cardTitle: string;
  cardSubtitle: string;
  accent: ElectionMaterialAccent;
  icon: ElectionMaterialIcon;
  quoteLabel: string;
  sizeNote: string;
  minQty: number;
  fieldType: QuoteFieldType;
}

export const ELECTION_MATERIALS: ElectionMaterialDefinition[] = [
  {
    id: "santinho",
    cardTitle: "Santinho",
    cardSubtitle: "Divulgação em massa",
    accent: "sky",
    icon: "doc",
    quoteLabel: "SANTINHO",
    sizeNote: "7×10cm",
    minQty: 100_000,
    fieldType: "qty_only",
  },
  {
    id: "santao",
    cardTitle: "Santão",
    cardSubtitle: "Grande formato",
    accent: "amber",
    icon: "wide",
    quoteLabel: "SANTÃO",
    sizeNote: "10×15cm",
    minQty: 70_000,
    fieldType: "qty_only",
  },
  {
    id: "praguinha",
    cardTitle: "Praguinha",
    cardSubtitle: "Para postes e ruas",
    accent: "rose",
    icon: "post",
    quoteLabel: "PRAGUINHA",
    sizeNote: "7×7cm",
    minQty: 5000,
    fieldType: "qty_only",
  },
  {
    id: "pragao",
    cardTitle: "Pragão",
    cardSubtitle: "Impacto máximo",
    accent: "blue",
    icon: "banner",
    quoteLabel: "PRAGÃO",
    sizeNote: "9×9cm",
    minQty: 5000,
    fieldType: "qty_only",
  },
  {
    id: "bandeiras",
    cardTitle: "Bandeiras",
    cardSubtitle: "Personalizadas",
    accent: "yellow",
    icon: "flag",
    quoteLabel: "BANDEIRA",
    sizeNote: "1,40×2,00m",
    minQty: 500,
    fieldType: "qty_only",
  },
  {
    id: "folder",
    cardTitle: "Folder",
    cardSubtitle: "Informação completa",
    accent: "violet",
    icon: "folder",
    quoteLabel: "FOLDER",
    sizeNote: "Padrão",
    minQty: 10_000,
    fieldType: "qty_only",
  },
  {
    id: "windbanner",
    cardTitle: "Windbanner",
    cardSubtitle: "Resistente ao vento",
    accent: "yellow",
    icon: "wind",
    quoteLabel: "WINDBANNER",
    sizeNote: "1,80×3,50m",
    minQty: 200,
    fieldType: "qty_only",
  },
  {
    id: "banner_tecido",
    cardTitle: "Banner tecido",
    cardSubtitle: "Alta durabilidade",
    accent: "red",
    icon: "fabric",
    quoteLabel: "BANNER TECIDO",
    sizeNote: "Sob medida (larg. × alt.)",
    minQty: 1,
    fieldType: "banner_dims",
  },
  {
    id: "cartao_visita",
    cardTitle: "Cartão de visita",
    cardSubtitle: "Identidade profissional",
    accent: "amber",
    icon: "card",
    quoteLabel: "CARTÃO DE VISITA",
    sizeNote: "9×5cm",
    minQty: 50_000,
    fieldType: "qty_only",
  },
  {
    id: "adesivo_perfurado",
    cardTitle: "Adesivo perfurado",
    cardSubtitle: "Visão por dentro",
    accent: "orange",
    icon: "perforated",
    quoteLabel: "ADESIVO PERFURADO",
    sizeNote: "40×70cm",
    minQty: 2000,
    fieldType: "qty_only",
  },
  {
    id: "adesivo_parachoque",
    cardTitle: "Adesivo para-choque",
    cardSubtitle: "Cola forte",
    accent: "red",
    icon: "bumper",
    quoteLabel: "ADESIVO PARA-CHOQUE",
    sizeNote: "10×30cm",
    minQty: 10_000,
    fieldType: "qty_only",
  },
  {
    id: "jornal",
    cardTitle: "Jornal",
    cardSubtitle: "Formato A3",
    accent: "blue",
    icon: "newspaper",
    quoteLabel: "JORNAL",
    sizeNote: "29,7×42cm",
    minQty: 5000,
    fieldType: "qty_only",
  },
];

const byId = Object.fromEntries(ELECTION_MATERIALS.map((m) => [m.id, m])) as Record<
  ElectionMaterialId,
  ElectionMaterialDefinition
>;

export function getElectionMaterial(id: string): ElectionMaterialDefinition | undefined {
  return byId[id as ElectionMaterialId];
}

export function buildElectionBudgetWhatsAppUrl(params: {
  selectedIds: string[];
  quantities: Record<string, number>;
  bannerWidth: number;
  bannerHeight: number;
}): string {
  const lines: string[] = [
    "Olá, Prismarq!",
    "",
    "Quero um *orçamento Eleição 2026* com os materiais abaixo:",
    "",
  ];

  for (const id of params.selectedIds) {
    const m = getElectionMaterial(id);
    if (!m) continue;

    if (m.fieldType === "banner_dims") {
      const qty = params.quantities[id] ?? m.minQty;
      lines.push(
        `*${m.quoteLabel}*`,
        `• Tamanho: ${params.bannerWidth}m × ${params.bannerHeight}m`,
        `• Quantidade mínima: ${m.minQty.toLocaleString("pt-BR")}`,
        `• Quantidade desejada: ${qty.toLocaleString("pt-BR")}`,
        "",
      );
    } else {
      const qty = params.quantities[id] ?? m.minQty;
      lines.push(
        `*${m.quoteLabel}*`,
        `• Tamanho: ${m.sizeNote}`,
        `• Quantidade mínima: ${m.minQty.toLocaleString("pt-BR")}`,
        `• Quantidade desejada: ${qty.toLocaleString("pt-BR")}`,
        "",
      );
    }
  }

  lines.push("Podem me retornar com valores e prazo? Obrigado!");

  const text = lines.join("\n");
  const base = companyLinks.whatsapp.split("?")[0];
  return `${base}?text=${encodeURIComponent(text)}`;
}
