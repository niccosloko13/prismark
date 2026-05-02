/**
 * Rótulos amigáveis só para exibição. Valores técnicos (material, finishing)
 * enviados ao carrinho/checkout permanecem os do catálogo.
 */
const FINISHING_FRIENDLY: Record<string, string> = {
  "4x0 - Colorido frente": "Frente colorida",
  "4x4 - Frente e verso": "Frente e verso",
  "Sem enobrecimento": "Padrão",
};

const MATERIAL_HINT: Record<string, string> = {
  "Lona brilho 340g": "Cores mais vivas",
  "Lona fosca 340g": "Menos reflexo",
  "Lona blackout 440g": "Bloqueia passagem de luz",
  "Ilhós": "Ideal para fixação em estrutura",
  "Bastão e cordão": "Ideal para pendurar",
  "Standard": "Melhor custo-benefício",
};

export function friendlyFinishingLabel(label: string): string {
  return FINISHING_FRIENDLY[label] ?? label;
}

export function materialChoiceHint(label: string): string | undefined {
  return MATERIAL_HINT[label];
}

/** Badge opcional por palavras-chave no rótulo (não altera dados). */
export function inferOptionBadge(label: string): "Mais vendido" | "Melhor custo-benefício" | "Premium" | "Ideal para eventos" | null {
  const t = label.toLowerCase();
  if (t.includes("premium") || t.includes("blackout")) return "Premium";
  if (t.includes("standard") || t.includes("econ")) return "Melhor custo-benefício";
  if (t.includes("evento") || t.includes("wind")) return "Ideal para eventos";
  if (t.includes("mais") && t.includes("vend")) return "Mais vendido";
  return null;
}
