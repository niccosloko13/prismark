import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { withController } from "@/server/controllers/controller-utils";
import { paymentsService } from "@/server/services/payments.service";
import type { PixKeyType } from "@/types";

export async function getPaymentSettingsController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const settings = await paymentsService.getSettingsForSession(session);
    return NextResponse.json({ settings });
  });
}

export async function upsertPaymentSettingsController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const body = (await request.json()) as {
      pixEnabled?: boolean;
      pixKey?: string | null;
      pixKeyType?: PixKeyType | null;
      pixReceiverName?: string | null;
      pixReceiverCity?: string | null;
    };

    const settings = await paymentsService.upsertSettings(
      {
        pixEnabled: body.pixEnabled,
        pixKey: body.pixKey,
        pixKeyType: body.pixKeyType,
        pixReceiverName: body.pixReceiverName,
        pixReceiverCity: body.pixReceiverCity,
      },
      session,
    );

    return NextResponse.json({ settings });
  });
}

export async function createPixPaymentController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ message: "Faça login para pagar o pedido." }, { status: 401 });
    }

    const body = (await request.json()) as { orderId?: string };
    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json({ message: "Pedido inválido para gerar Pix." }, { status: 400 });
    }

    const result = await paymentsService.createOrGetPendingPixPayment(orderId, session);
    if (!result.available) {
      return NextResponse.json({
        available: false,
        message: "Pix indisponível no momento.",
      });
    }

    return NextResponse.json({
      available: true,
      payment: result.payment,
      order: result.order,
    });
  });
}

export async function listPendingPaymentsController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const payments = await paymentsService.listPendingForAdmin(session);
    return NextResponse.json({ payments });
  });
}

export async function updatePaymentStatusController(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as { action?: "confirm" | "cancel" };

    if (body.action === "confirm") {
      const payment = await paymentsService.confirmPayment(id, session);
      return NextResponse.json({ payment });
    }

    if (body.action === "cancel") {
      const payment = await paymentsService.cancelPayment(id, session);
      return NextResponse.json({ payment });
    }

    return NextResponse.json({ message: "Ação inválida para pagamento." }, { status: 400 });
  });
}
