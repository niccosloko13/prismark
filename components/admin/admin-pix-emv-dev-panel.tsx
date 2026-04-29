"use client";

import { useState, useTransition } from "react";

type PreviewResponse = {
  pixKeyType: string;
  pixKeyRaw: string;
  pixKeySanitized: string;
  amount: number;
  amountField54: string;
  txid: string;
  txidLength: number;
  payload: string;
  payloadLength: number;
  qrEqualsCopyPaste: boolean;
  note?: string;
  message?: string;
};

export function AdminPixEmvDevPanel() {
  const [amount, setAmount] = useState("159.73");
  const [txid, setTxid] = useState("");
  const [result, setResult] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function runPreview() {
    setError("");
    setResult(null);
    const n = Number(amount.replace(",", "."));
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/pix-emv-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: n, txid: txid.trim() || undefined }),
        });
        const data = (await response.json()) as PreviewResponse & { message?: string };
        if (!response.ok) {
          throw new Error(data.message ?? "Falha no preview.");
        }
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro desconhecido.");
      }
    });
  }

  return (
    <section className="mt-6 rounded-[14px] border-2 border-dashed border-amber-400/80 bg-amber-50/90 p-4 text-ink">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Somente desenvolvimento</p>
      <h3 className="mt-1 text-lg font-semibold text-amber-950">Preview EMV Pix (BR Code)</h3>
      <p className="mt-1 text-sm text-amber-950/80">
        Gera o mesmo tipo de payload do checkout. Use para testar no app bancário. Não aparece em build de produção na
        API.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-amber-950">Valor (R$)</span>
          <input
            className="field w-32"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-amber-950">TXID opcional (máx. 25 alfanum.)</span>
          <input className="field w-48" value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="vazio = gerado" />
        </label>
        <button type="button" className="btn btn-primary" disabled={isPending} onClick={runPreview}>
          {isPending ? "Gerando..." : "Gerar preview"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-4 space-y-2 font-mono text-xs leading-relaxed text-amber-950">
          <p>
            <strong>pixKeyType:</strong> {result.pixKeyType}
          </p>
          <p>
            <strong>pixKey (cadastro):</strong> {result.pixKeyRaw}
          </p>
          <p>
            <strong>pixKeySanitized:</strong> {result.pixKeySanitized}
          </p>
          <p>
            <strong>amount:</strong> {result.amount} → <strong>campo 54:</strong> {result.amountField54}{" "}
            {result.amountField54.includes(".") ? "✓ ponto decimal" : "✗"}
          </p>
          <p>
            <strong>txid:</strong> {result.txid} ({result.txidLength} chars, máx. 25)
          </p>
          <p>
            <strong>payloadLength:</strong> {result.payloadLength}
          </p>
          <p>
            <strong>QR === copia-e-cola:</strong> {result.qrEqualsCopyPaste ? "sim (mesmo string no checkout)" : "não"}
          </p>
          {result.note ? <p className="text-amber-900/90">{result.note}</p> : null}
          <label className="mt-2 block">
            <span className="text-xs font-semibold text-amber-950">payload final</span>
            <textarea
              readOnly
              className="mt-1 w-full min-h-[120px] rounded-lg border border-amber-300 bg-white p-2 text-[0.7rem] text-neutral-900"
              value={result.payload}
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
