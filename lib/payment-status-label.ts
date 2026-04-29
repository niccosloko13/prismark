import type { PaymentStatus } from "@/types";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Aguardando pagamento",
  CONFIRMED: "Pago confirmado",
  CANCELLED: "Cancelado",
};
