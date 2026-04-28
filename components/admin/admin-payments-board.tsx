"use client";

import { useState, useTransition } from "react";

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
        {error ? <p className="font-medium text-red-600">{error}</p> : null}
        {!error && message ? <p className="font-medium text-emerald-700">{message}</p> : null}
      </div>

      <div className="grid gap-3">
        {payments.map((payment) => (
          <article key={payment.id} className="panel p-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <p>
                <strong>Pedido:</strong> #{payment.order.id}
              </p>
              <p>
                <strong>txid:</strong> {payment.txid}
              </p>
              <p>
                <strong>Cliente:</strong> {payment.order.clientName}
              </p>
              <p>
                <strong>Contato:</strong> {payment.order.clientEmail}
                {payment.order.clientPhone ? ` | ${payment.order.clientPhone}` : ""}
              </p>
              <p>
                <strong>Produto:</strong> {payment.order.productName}
              </p>
              <p>
                <strong>Quantidade:</strong> {payment.order.measures.quantity} un.
              </p>
              <p>
                <strong>Valor:</strong> {formatCurrencyBRL(payment.order.value)}
              </p>
              <p>
                <strong>Data/hora:</strong> {formatDateBR(payment.createdAt)}
              </p>
              <p>
                <strong>Status:</strong> {payment.status}
              </p>
              <p>
                <strong>Comprovante:</strong> {payment.proofUrl ? "Enviado" : "Não enviado"}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled={isPending} onClick={() => handleAction(payment.id, "confirm")}>
                Confirmar pagamento
              </button>
              <button className="btn btn-secondary" disabled={isPending} onClick={() => handleAction(payment.id, "cancel")}>
                Cancelar
              </button>
            </div>
          </article>
        ))}
        {payments.length === 0 ? <p className="panel p-4 text-sm text-black/58">Nenhum pagamento pendente.</p> : null}
      </div>
    </div>
  );
}
