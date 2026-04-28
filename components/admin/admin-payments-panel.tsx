"use client";

import { useMemo, useState, useTransition } from "react";

import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { PIX_KEY_TYPES, type PaymentSettingsRecord, type PaymentWithOrderRecord, type PixKeyType } from "@/types";

export function AdminPaymentsPanel({
  initialSettings,
  initialPendingPayments,
}: {
  initialSettings: PaymentSettingsRecord | null;
  initialPendingPayments: PaymentWithOrderRecord[];
}) {
  const [settings, setSettings] = useState<PaymentSettingsRecord | null>(initialSettings);
  const [pendingPayments, setPendingPayments] = useState<PaymentWithOrderRecord[]>(initialPendingPayments);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    pixEnabled: initialSettings?.pixEnabled ?? false,
    pixKeyType: initialSettings?.pixKeyType ?? "CNPJ",
    pixKey: initialSettings?.pixKey ?? "",
    pixReceiverName: initialSettings?.pixReceiverName ?? "",
    pixReceiverCity: initialSettings?.pixReceiverCity ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const pendingCount = useMemo(() => pendingPayments.length, [pendingPayments]);

  function saveSettings() {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/payments/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pixEnabled: formState.pixEnabled,
            pixKeyType: formState.pixKeyType,
            pixKey: formState.pixKey,
            pixReceiverName: formState.pixReceiverName,
            pixReceiverCity: formState.pixReceiverCity,
          }),
        });

        const payload = (await response.json()) as { settings?: PaymentSettingsRecord; message?: string };
        if (!response.ok || !payload.settings) {
          throw new Error(payload.message ?? "Nao foi possivel salvar configuracoes de Pix.");
        }

        setSettings(payload.settings);
        setMessage("Configuração de Pix atualizada com sucesso.");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  function updatePayment(paymentId: string, action: "confirm" | "cancel") {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        });

        const payload = (await response.json()) as { payment?: { id: string }; message?: string };
        if (!response.ok || !payload.payment) {
          throw new Error(payload.message ?? "Falha ao atualizar o pagamento.");
        }

        setPendingPayments((current) => current.filter((item) => item.id !== paymentId));
        setMessage(action === "confirm" ? "Pagamento confirmado com sucesso." : "Pagamento cancelado com sucesso.");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-6 sm:p-8">
        <p className="label-kicker">Pagamento Pix</p>
        <h2 className="display-title mt-2 text-2xl font-semibold tracking-tight text-ink">Configuração do Pix</h2>
        <p className="mt-2 text-sm leading-6 text-black/62">
          Configure a chave Pix para gerar QR Code e código copia-e-cola no checkout.
        </p>

        <div className="mt-5 grid gap-4">
          <label className="flex items-center gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={formState.pixEnabled}
              onChange={(event) => setFormState((current) => ({ ...current, pixEnabled: event.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-ink">Ativar Pix no checkout</span>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-black/62">Tipo da chave</span>
            <select
              value={formState.pixKeyType}
              onChange={(event) => setFormState((current) => ({ ...current, pixKeyType: event.target.value as PixKeyType }))}
              className="field"
            >
              {PIX_KEY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-black/62">Chave Pix</span>
            <input
              type="text"
              value={formState.pixKey}
              onChange={(event) => setFormState((current) => ({ ...current, pixKey: event.target.value }))}
              className="field"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-black/62">Nome do recebedor</span>
              <input
                type="text"
                value={formState.pixReceiverName}
                onChange={(event) => setFormState((current) => ({ ...current, pixReceiverName: event.target.value }))}
                className="field"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-black/62">Cidade do recebedor</span>
              <input
                type="text"
                value={formState.pixReceiverCity}
                onChange={(event) => setFormState((current) => ({ ...current, pixReceiverCity: event.target.value }))}
                className="field"
              />
            </label>
          </div>
        </div>

        <button type="button" onClick={saveSettings} disabled={isPending} className="btn btn-primary focus-ring mt-5">
          Salvar configuração Pix
        </button>

        <div className="mt-4 min-h-6 text-sm">
          {error ? <p className="font-medium text-red-600">{error}</p> : null}
          {!error && message ? <p className="font-medium text-emerald-700">{message}</p> : null}
        </div>

        {settings ? (
          <div className="mt-4 rounded-[18px] border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black/64">
            {settings.pixEnabled ? "Pix ativo no checkout." : "Pix desativado no checkout."}
          </div>
        ) : null}
      </section>

      <section className="panel p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-kicker">Pagamentos pendentes</p>
            <h2 className="display-title mt-2 text-2xl font-semibold tracking-tight text-ink">Aguardando pagamento</h2>
          </div>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/58">
            {pendingCount} pendente(s)
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {pendingPayments.length === 0 ? (
            <div className="rounded-[18px] border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black/58">
              Nenhum pagamento pendente no momento.
            </div>
          ) : (
            pendingPayments.map((payment) => (
              <article key={payment.id} className="rounded-[18px] border border-black/10 bg-white p-4 shadow-[0_8px_20px_rgba(15,15,15,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">Pedido #{payment.order.id}</p>
                    <p className="mt-1 text-xs text-black/58">{payment.order.productName}</p>
                  </div>
                  <strong className="text-base font-semibold text-ink">{formatCurrencyBRL(payment.order.value)}</strong>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-black/58 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-black/64">Código do pedido:</span> #{payment.order.id}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">txid:</span> {payment.txid}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Produto:</span> {payment.order.productName}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Quantidade:</span> {payment.order.measures.quantity} un.
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Total:</span> {formatCurrencyBRL(payment.order.value)}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Cliente:</span> {payment.order.clientName}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Contato:</span> {payment.order.clientEmail}
                    {payment.order.clientPhone ? ` | ${payment.order.clientPhone}` : ""}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Data/hora do Pix:</span> {formatDateBR(payment.createdAt)}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Status:</span> {payment.status}
                  </p>
                  <p>
                    <span className="font-semibold text-black/64">Comprovante:</span> {payment.proofUrl ? "Enviado" : "Não enviado"}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => updatePayment(payment.id, "confirm")}
                    className="btn btn-primary focus-ring"
                  >
                    Confirmar pagamento
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => updatePayment(payment.id, "cancel")}
                    className="btn btn-secondary focus-ring"
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
