/** Sincroniza altura do CTA fixo na single product com o botão flutuante (WhatsApp). */
export const PRISMARQ_PRODUCT_CTA_EVENT = "prismarq:product-cta" as const;

export type ProductCtaBroadcastDetail = { mode: "compact" | "full" | null };
