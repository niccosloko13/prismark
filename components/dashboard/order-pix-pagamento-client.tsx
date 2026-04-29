"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { OrderRecord, PaymentRecord } from "@/types";

export function OrderPixPagamentoClient({
  order,
  payment,
  outrosPedidosPix = 0,
}: {
  order: OrderRecord;
  payment: PaymentRecord;
  /** Quantidade de pedidos Pix adicionais (ex.: carrinho com vários itens). */
  outrosPedidosPix?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPix() {
    if (!payment.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(payment.pixCopyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop — browser sem clipboard */
    }
  }

  if (payment.status === "CONFIRMED") {
    return (
      <div className="panel p-6 sm:p-8">
        <p className="label-kicker">Pagamento</p>
        <h1 className="display-title mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pagamento confirmado
        </h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          Pedido <span className="font-mono font-semibold text-white">#{order.id}</span>
          {payment.confirmedAt ? (
            <>
              {" "}
              · identificado em {formatDateBR(payment.confirmedAt)}
            </>
          ) : null}
          .
        </p>
        <Link href="/dashboard" className="btn btn-primary focus-ring mt-6 inline-flex">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  if (payment.status === "CANCELLED") {
    return (
      <div className="panel p-6 sm:p-8">
        <p className="label-kicker">Pagamento</p>
        <h1 className="display-title mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pagamento cancelado
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Este Pix não está mais ativo. Em caso de dúvida, fale com o suporte Prismarq.
        </p>
        <Link href="/dashboard" className="btn btn-secondary focus-ring mt-6 inline-flex">
          Ir ao painel
        </Link>
      </div>
    );
  }

  return (
    <div className="panel p-6 sm:p-8 lg:p-10">
      <p className="label-kicker">Pagamento via Pix</p>
      <h1 className="display-title mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tight text-white">
        Pedido #{order.id}
      </h1>
      <p className="mt-2 text-sm font-semibold text-amber-100/90">Aguardando pagamento</p>

      <p className="mt-6 text-2xl font-semibold tabular-nums text-white">{formatCurrencyBRL(payment.amount)}</p>
      <p className="mt-1 text-sm text-white/60">QR e copia-e-cola com o mesmo payload Pix.</p>

      <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72">
        Após o pagamento, sua confirmação será identificada e o pedido seguirá para produção.
      </p>

      {outrosPedidosPix > 0 ? (
        <p className="mt-4 max-w-2xl rounded-[18px] border border-cyan/25 bg-cyan/10 px-4 py-3 text-sm leading-6 text-cyan-100">
          Você tem mais {outrosPedidosPix} pedido(s) gerado(s) no mesmo fechamento. Pague cada um no painel em
          &quot;Pagar com Pix&quot; após concluir este.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
          {payment.pixQrDataUrl ? (
            <Image
              src={payment.pixQrDataUrl}
              alt="QR Code Pix"
              width={232}
              height={232}
              unoptimized
              className="mx-auto rounded-[14px]"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-[14px] bg-white/[0.06] text-sm text-white/55">
              QR indisponível — use o código abaixo.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/50">Pix copia-e-cola</p>
            <textarea
              readOnly
              value={payment.pixCopyPaste ?? ""}
              className="field mt-2 min-h-[120px] w-full rounded-[18px] text-[0.78rem] leading-5"
            />
          </div>
          <button type="button" onClick={copyPix} className="btn btn-primary focus-ring w-full sm:w-auto">
            {copied ? "Código copiado!" : "Copiar código Pix"}
          </button>
          <p className="text-xs text-white/50">
            txid: <span className="font-mono text-white/70">{payment.txid}</span>
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard" className="btn btn-secondary focus-ring">
          Acompanhar no painel
        </Link>
      </div>
    </div>
  );
}
