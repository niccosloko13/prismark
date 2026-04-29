"use client";

import { useState, useTransition } from "react";

import { PAYMENT_STATUS_LABELS } from "@/lib/payment-status-label";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { PaymentWithOrderRecord } from "@/types";

export function AdminPaymentsBoard({ initialPayments }: { initialPayments: PaymentWithOrderRecord[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleAction(paymentId: string, action: "confirm" | "cancel") {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const payload = (await response.json()) as { payment?: { id: string }; message?: string };
        if (!response.ok || !payload.payment) {
          throw new Error(payload.message ?? "Falha ao atualizar pagamento.");
        }
        setPayments((prev) => prev.filter((item) => item.id !== paymentId));
        setMessage(action === "confirm" ? "Pagamento confirmado." : "Pagamento cancelado.");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="min-h-6 text-sm">
        {error ? <p className="font-medium text-red-300">{error}</p> : null}
        {!error && message ? <p className="font-medium text-emerald-300">{message}</p> : null}
      </div>

      <div className="grid gap-3">
        {payments.map((payment) => (
          <article
            key={payment.id}
            className="rounded-[22px] border border-white/10 bg-[#0d1019]/92 p-4 backdrop-blur-xl"
          >
            <div className="grid gap-2 text-sm text-white/75 sm:grid-cols-2 xl:grid-cols-4">
              <p>
                <strong className="text-white">Pedido:</strong> #{payment.order.id}
              </p>
              <p>
                <strong className="text-white">txid:</strong> {payment.txid}
              </p>
              <p>
                <strong className="text-white">Cliente:</strong> {payment.order.clientName}
              </p>
              <p>
                <strong className="text-white">Contato:</strong> {payment.order.clientEmail}
                {payment.order.clientPhone ? ` | ${payment.order.clientPhone}` : ""}
              </p>
              <p>
                <strong className="text-white">Produto:</strong> {payment.order.productName}
              </p>
              <p>
                <strong className="text-white">Quantidade:</strong> {payment.order.measures.quantity} un.
              </p>
              <p>
                <strong className="text-white">Valor:</strong> {formatCurrencyBRL(payment.order.value)}
              </p>
              <p>
                <strong className="text-white">Data/hora:</strong> {formatDateBR(payment.createdAt)}
              </p>
              <p>
                <strong className="text-white">Status do Pix:</strong> {PAYMENT_STATUS_LABELS[payment.status]}
              </p>
              <p>
                <strong className="text-white">Comprovante:</strong> {payment.proofUrl ? "Enviado" : "Não enviado"}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="focus-ring rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={isPending}
                onClick={() => handleAction(payment.id, "confirm")}
              >
                Marcar como pago
              </button>
              <button
                className="focus-ring rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                disabled={isPending}
                onClick={() => handleAction(payment.id, "cancel")}
              >
                Marcar como cancelado
              </button>
            </div>
          </article>
        ))}
        {payments.length === 0 ? (
          <p className="rounded-[22px] border border-white/10 bg-[#0d1019]/80 p-4 text-sm text-white/55">Nenhum pagamento pendente.</p>
        ) : null}
      </div>
    </div>
  );
}
