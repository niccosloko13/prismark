/**
 * Percentual Pix na vitrine — fixo 10% (sem leitura em `site_settings`).
 */
export async function getStorefrontPixDiscountPercent(): Promise<number> {
  return 10;
}
