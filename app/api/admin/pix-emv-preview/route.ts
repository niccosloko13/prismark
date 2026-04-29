import { NextRequest, NextResponse } from "next/server";

import { generateStaticPixPayload, sanitizePixKey } from "@/lib/pix/br-code";
import { getSessionFromRequest } from "@/lib/auth";
import { paymentSettingsRepository } from "@/server/repositories/payment-settings.repository";
import { generatePixTxid } from "@/server/payments/pix";
import { withController } from "@/server/controllers/controller-utils";

export const runtime = "nodejs";

/**
 * Só em desenvolvimento: preview do payload EMV com configuração atual (admin).
 * Não disponível em produção.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Indisponível." }, { status: 404 });
  }

  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Acesso restrito a administradores." }, { status: 403 });
    }

    const body = (await request.json()) as { amount?: number; txid?: string };
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Informe amount numérico maior que zero." }, { status: 400 });
    }

    const settings = await paymentSettingsRepository.get();
    if (!settings?.pixEnabled || !settings.pixKey || !settings.pixKeyType) {
      return NextResponse.json({ message: "Ative o Pix e salve chave + tipo antes do preview." }, { status: 400 });
    }

    const rawTxid = body.txid?.trim();
    const txid = rawTxid && rawTxid.length > 0 ? rawTxid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) : generatePixTxid("preview");
    if (!txid) {
      return NextResponse.json({ message: "TXID inválido após sanitização." }, { status: 400 });
    }

    let pixKeySanitized: string;
    try {
      pixKeySanitized = sanitizePixKey(settings.pixKey, settings.pixKeyType);
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Falha ao sanitizar chave." },
        { status: 400 },
      );
    }

    const amountField54 = amount.toFixed(2);
    const payload = generateStaticPixPayload({
      key: settings.pixKey,
      keyType: settings.pixKeyType,
      merchantName: settings.pixReceiverName ?? "",
      merchantCity: settings.pixReceiverCity ?? "",
      amount,
      txid,
    });

    return NextResponse.json({
      pixKeyType: settings.pixKeyType,
      pixKeyRaw: settings.pixKey,
      pixKeySanitized,
      receiverName: settings.pixReceiverName,
      receiverCity: settings.pixReceiverCity,
      amount,
      amountField54,
      txid,
      txidLength: txid.length,
      payload,
      payloadLength: payload.length,
      qrEqualsCopyPaste: true,
      note: "O QR do checkout é gerado com o mesmo texto de payload (copia-e-cola).",
    });
  });
}
