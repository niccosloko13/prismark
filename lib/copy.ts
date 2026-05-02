import { PIX_DISCOUNT_PERCENT } from "@/lib/pix-discount";

/** Textos de interface centralizados (checkout, produto, pagamentos). */
export const COPY = {
  buyNow: "Comprar agora",
  addToCart: "Adicionar ao carrinho",
  saveToCart: "Salvar no carrinho",
  finalizeOrder: "Finalizar pedido",
  finalizeOrderNow: "Finalizar pedido agora",
  finalizeOrderWithArt: "Finalizar pedido com arte",
  payWithPix: "Pagar com Pix",
  awaitingPayment: "Aguardando pagamento",
  continueWithAccount: "Criar conta ou entrar",
  continueWithAccountHint:
    "Você precisa de uma conta para concluir. Após cadastro ou login, você volta para este pedido com os dados preenchidos.",
  /** CTA do resumo do produto quando o fluxo guiado ainda não foi concluído. */
  completeOptions: "Complete as opções",
  /** Cartão indisponível na loja (manutenção). */
  cardMaintenanceHint: "Pagamento com cartão temporariamente indisponível",
  /** Após checkout Pix. */
  pixOrderConfirmedAfterPayment: "Seu pedido será confirmado após o pagamento via Pix.",
} as const;

/** Badge fixa alinhada ao percentual da loja. */
export function pixOffNoPixLabel(): string {
  return `${PIX_DISCOUNT_PERCENT}% OFF no PIX`;
}

/** Frase principal de economia no PIX. */
export function pixEconomizePagarNoPixLabel(): string {
  return `Economize ${PIX_DISCOUNT_PERCENT}% pagando no PIX`;
}
