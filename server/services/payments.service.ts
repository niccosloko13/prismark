import { withTransaction } from "@/server/db";
import { AppError } from "@/server/errors/app-error";
import { ordersRepository } from "@/server/repositories/orders.repository";
import { paymentSettingsRepository } from "@/server/repositories/payment-settings.repository";
import { paymentsRepository } from "@/server/repositories/payments.repository";
import { logger } from "@/server/services/logger";
import { buildPixCopyPaste, describePixAmount, generatePixTxid } from "@/server/payments/pix";
import type { PixKeyType, SessionUser } from "@/types";

function normalizeNullable(value?: string | null) {
  const text = value?.trim();
  return text && text.length > 0 ? text : null;
}

export const paymentsService = {
  async getSettingsForSession(user: SessionUser) {
    if (user.role !== "admin") {
      throw new AppError("Somente admin pode visualizar configurações de pagamento.", 403, "admin_only");
    }

    return paymentSettingsRepository.get();
  },

  async upsertSettings(
    rawInput: {
      pixEnabled?: boolean;
      pixKey?: string | null;
      pixKeyType?: PixKeyType | null;
      pixReceiverName?: string | null;
      pixReceiverCity?: string | null;
    },
    user: SessionUser,
  ) {
    if (user.role !== "admin") {
      throw new AppError("Somente admin pode configurar pagamentos.", 403, "admin_only");
    }

    const pixEnabled = Boolean(rawInput.pixEnabled);
    const pixKey = normalizeNullable(rawInput.pixKey);
    const pixReceiverName = normalizeNullable(rawInput.pixReceiverName);
    const pixReceiverCity = normalizeNullable(rawInput.pixReceiverCity);
    const pixKeyType = rawInput.pixKeyType ?? null;

    if (pixEnabled) {
      if (!pixKey || !pixKeyType || !pixReceiverName || !pixReceiverCity) {
        throw new AppError(
          "Preencha chave Pix, tipo da chave, nome e cidade do recebedor para ativar o Pix.",
          400,
          "pix_settings_invalid",
        );
      }
    }

    const settings = await paymentSettingsRepository.upsert({
      pixEnabled,
      pixKey,
      pixKeyType,
      pixReceiverName,
      pixReceiverCity,
    });

    logger.info("Configuração Pix atualizada", {
      actorUserId: user.id,
      pixEnabled,
      pixKeyType,
    });

    return settings;
  },

  async createOrGetPendingPixPayment(orderId: string, user: SessionUser) {
    const order = await ordersRepository.findById(orderId);
    if (!order) {
      throw new AppError("Pedido não encontrado.", 404, "order_not_found");
    }

    if (user.role !== "admin" && order.clientId !== user.id) {
      throw new AppError("Acesso negado ao pedido.", 403, "order_forbidden");
    }

    const settings = await paymentSettingsRepository.get();
    const isPixReady =
      Boolean(settings?.pixEnabled) &&
      Boolean(settings?.pixKey) &&
      Boolean(settings?.pixReceiverName) &&
      Boolean(settings?.pixReceiverCity);

    if (!isPixReady) {
      return {
        available: false as const,
      };
    }

    const existingPayment = await paymentsRepository.findPendingByOrderId(order.id);
    if (existingPayment) {
      return {
        available: true as const,
        payment: existingPayment,
        order,
      };
    }

    const txid = generatePixTxid(order.id);
    const pixCopyPaste = buildPixCopyPaste({
      pixKey: settings!.pixKey!,
      receiverName: settings!.pixReceiverName!,
      receiverCity: settings!.pixReceiverCity!,
      amount: order.value,
      txid,
      description: describePixAmount(order.value),
    });

    const payment = await withTransaction(async (client) => {
      const createdPayment = await paymentsRepository.create(
        {
          orderId: order.id,
          amount: order.value,
          method: "PIX_MANUAL",
          status: "PENDING",
          txid,
          pixCopyPaste,
          proofUrl: null,
        },
        client,
      );

      await ordersRepository.updateStatus(order.id, "aguardando pagamento", client);
      await ordersRepository.createStatusHistory(
        {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "aguardando pagamento",
          changedByUserId: user.id,
          note: "Pagamento Pix aguardando identificação.",
        },
        client,
      );

      await ordersRepository.createAuditLog(
        {
          orderId: order.id,
          action: "pix_payment_created",
          actorUserId: user.id,
          payload: {
            txid,
            amount: order.value,
          },
        },
        client,
      );

      if (!createdPayment) {
        throw new AppError("Não foi possível criar pagamento Pix.", 500, "payment_create_failed");
      }

      return createdPayment;
    });

    logger.info("Pagamento Pix pendente criado", {
      orderId: order.id,
      txid: payment.txid,
      actorUserId: user.id,
    });

    const freshOrder = await ordersRepository.findById(order.id);
    if (!freshOrder) {
      throw new AppError("Pedido não encontrado após gerar pagamento.", 404, "order_not_found");
    }

    return {
      available: true as const,
      payment,
      order: freshOrder,
    };
  },

  async listPendingForAdmin(user: SessionUser) {
    if (user.role !== "admin") {
      throw new AppError("Somente admin pode listar pagamentos pendentes.", 403, "admin_only");
    }
    return paymentsRepository.listPending();
  },

  async confirmPayment(paymentId: string, user: SessionUser) {
    if (user.role !== "admin") {
      throw new AppError("Somente admin pode confirmar pagamentos.", 403, "admin_only");
    }

    const payment = await paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new AppError("Pagamento não encontrado.", 404, "payment_not_found");
    }

    if (payment.status !== "PENDING") {
      return payment;
    }

    await withTransaction(async (client) => {
      await paymentsRepository.updateStatus(
        paymentId,
        {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          cancelledAt: null,
        },
        client,
      );

      const order = await ordersRepository.findById(payment.orderId, client);
      if (!order) {
        throw new AppError("Pedido não encontrado.", 404, "order_not_found");
      }

      await ordersRepository.updateStatus(payment.orderId, "confirmado", client);
      await ordersRepository.createStatusHistory(
        {
          orderId: payment.orderId,
          fromStatus: order.status,
          toStatus: "confirmado",
          changedByUserId: user.id,
          note: "Pagamento identificado e confirmado.",
        },
        client,
      );
      await ordersRepository.createAuditLog(
        {
          orderId: payment.orderId,
          action: "pix_payment_confirmed",
          actorUserId: user.id,
          payload: {
            paymentId,
            txid: payment.txid,
          },
        },
        client,
      );
    });

    const updated = await paymentsRepository.findById(paymentId);
    if (!updated) {
      throw new AppError("Pagamento não encontrado após confirmação.", 404, "payment_not_found");
    }
    return updated;
  },

  async cancelPayment(paymentId: string, user: SessionUser) {
    if (user.role !== "admin") {
      throw new AppError("Somente admin pode cancelar pagamentos.", 403, "admin_only");
    }

    const payment = await paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new AppError("Pagamento não encontrado.", 404, "payment_not_found");
    }

    if (payment.status !== "PENDING") {
      return payment;
    }

    await withTransaction(async (client) => {
      await paymentsRepository.updateStatus(
        paymentId,
        {
          status: "CANCELLED",
          confirmedAt: null,
          cancelledAt: new Date(),
        },
        client,
      );

      const order = await ordersRepository.findById(payment.orderId, client);
      if (!order) {
        throw new AppError("Pedido não encontrado.", 404, "order_not_found");
      }

      await ordersRepository.updateStatus(payment.orderId, "cancelado", client);
      await ordersRepository.createStatusHistory(
        {
          orderId: payment.orderId,
          fromStatus: order.status,
          toStatus: "cancelado",
          changedByUserId: user.id,
          note: "Pagamento cancelado no painel administrativo.",
        },
        client,
      );
      await ordersRepository.createAuditLog(
        {
          orderId: payment.orderId,
          action: "pix_payment_cancelled",
          actorUserId: user.id,
          payload: {
            paymentId,
            txid: payment.txid,
          },
        },
        client,
      );
    });

    const updated = await paymentsRepository.findById(paymentId);
    if (!updated) {
      throw new AppError("Pagamento não encontrado após cancelamento.", 404, "payment_not_found");
    }
    return updated;
  },
};
