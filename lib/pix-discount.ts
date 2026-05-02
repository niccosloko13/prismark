import { roundTo } from "@/lib/utils";

/** Desconto Pix fixo em toda a loja (vitrine, carrinho, checkout, pedido). */
export const PIX_DISCOUNT_PERCENT = 10;

/** Preço no Pix: valor cheio menos o percentual fixo, arredondado em 2 casas (BRL). */
export function applyPixDiscount(value: number): number {
  return roundTo(value * (1 - PIX_DISCOUNT_PERCENT / 100), 2);
}
