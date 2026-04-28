"use client";

import { useState, useTransition } from "react";

import { PIX_KEY_TYPES, type PaymentSettingsRecord, type PixKeyType } from "@/types";

function maskKey(value: string | null) {
  if (!value) return "-";
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

export function AdminPixSettingsForm({ initialSettings }: { initialSettings: PaymentSettingsRecord | null }) {
  const [state, setState] = useState({
    pixEnabled: initialSettings?.pixEnabled ?? false,
    pixKeyType: (initialSettings?.pixKeyType ?? "CNPJ") as PixKeyType,
    pixKey: initialSettings?.pixKey ?? "",
    pixReceiverName: initialSettings?.pixReceiverName ?? "",
    pixReceiverCity: initialSettings?.pixReceiverCity ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function save() {
    setError("");
    setMessage("");

    if (state.pixEnabled && (!state.pixKey || !state.pixReceiverName || !state.pixReceiverCity)) {
      setError("Para ativar Pix, preencha chave, nome do recebedor e cidade.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/payments/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
        const payload = (await response.json()) as { message?: string };
        if (!response.ok) throw new Error(payload.message ?? "Falha ao salvar configuração Pix.");
        setMessage("Configuração Pix salva com sucesso.");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  return (
    <section className="panel p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={state.pixEnabled}
            onChange={(event) => setState((prev) => ({ ...prev, pixEnabled: event.target.checked }))}
          />
          <span className="text-sm font-semibold text-ink">Ativar Pix manual</span>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-black/62">Tipo da chave</span>
          <select
            className="field"
            value={state.pixKeyType}
            onChange={(event) => setState((prev) => ({ ...prev, pixKeyType: event.target.value as PixKeyType }))}
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
          <input className="field" value={state.pixKey} onChange={(e) => setState((p) => ({ ...p, pixKey: e.target.value }))} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-black/62">Nome do recebedor</span>
          <input
            className="field"
            value={state.pixReceiverName}
            onChange={(e) => setState((p) => ({ ...p, pixReceiverName: e.target.value }))}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-black/62">Cidade do recebedor</span>
          <input
            className="field"
            value={state.pixReceiverCity}
            onChange={(e) => setState((p) => ({ ...p, pixReceiverCity: e.target.value }))}
          />
        </label>
      </div>

      <button className="btn btn-primary mt-4" disabled={isPending} onClick={save}>
        {isPending ? "Salvando..." : "Salvar"}
      </button>

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
      {!error && message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}

      <article className="mt-4 rounded-[14px] border border-black/10 bg-white p-3 text-sm">
        <p>
          <strong>Status:</strong> {state.pixEnabled ? "Pix ativo" : "Pix inativo"}
        </p>
        <p>
          <strong>Recebedor:</strong> {state.pixReceiverName || "-"}
        </p>
        <p>
          <strong>Cidade:</strong> {state.pixReceiverCity || "-"}
        </p>
        <p>
          <strong>Tipo:</strong> {state.pixKeyType}
        </p>
        <p>
          <strong>Chave:</strong> {maskKey(state.pixKey || null)}
        </p>
      </article>
    </section>
  );
}
