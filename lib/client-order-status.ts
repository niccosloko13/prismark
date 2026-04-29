import type { OrderStatus } from "@/types";

/** Rótulos amigáveis no painel do cliente (pedidos). */
export const CLIENT_ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: "Novo",
  "aguardando pagamento": "Aguardando pagamento",
  confirmado: "Pago confirmado",
  cancelado: "Cancelado",
  "aguardando arte": "Aguardando arte",
  "em análise": "Em análise",
  produção: "Em produção",
  finalizado: "Finalizado",
  entregue: "Finalizado",
};
