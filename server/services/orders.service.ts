import { withTransaction } from "@/server/db";
import { AppError } from "@/server/errors/app-error";
import { getActiveProductBySlug } from "@/lib/active-products";
import { applyPixDiscount } from "@/lib/pix-discount";
import { calculateQuoteForProduct } from "@/lib/pricing";
import { buildProductExperience, getAddonsFeeTotalByIds } from "@/lib/product-experience";
import { filesRepository } from "@/server/repositories/files.repository";
import { ordersRepository } from "@/server/repositories/orders.repository";
import { logger } from "@/server/services/logger";
import { createOrderSchema, updateOrderStatusSchema } from "@/server/validation/orders";
import type { CreateOrderInput, SessionUser, UpdateOrderStatusInput } from "@/types";

export const ordersService = {
  async listForSession(user: SessionUser) {
    return user.role === "admin"
      ? ordersRepository.findAll()
      : ordersRepository.findByClientId(user.id);
  },

  async findOneForSession(orderId: string, user: SessionUser) {
    const order = await ordersRepository.findById(orderId);

    if (!order) {
      throw new AppError("Pedido não encontrado.", 404, "order_not_found");
    }

    if (user.role !== "admin" && order.clientId !== user.id) {
      throw new AppError("Acesso negado.", 403, "order_forbidden");
    }

    return order;
  },

  async create(rawInput: CreateOrderInput, user: SessionUser) {
    const input = createOrderSchema.parse(rawInput);
    const active = await getActiveProductBySlug(input.productSlug);

    if (!active) {
      throw new AppError("Produto indisponível ou não encontrado.", 404, "product_not_found");
    }

    const product = active;

    if (input.quantity < product.minQuantity) {
      throw new AppError("Quantidade abaixo do mínimo do produto.", 400, "invalid_quantity");
    }

    const experience = buildProductExperience(product);
    const addonsTotal = getAddonsFeeTotalByIds(experience, input.selectedAddonIds ?? []);

    const quote = calculateQuoteForProduct(product, {
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      material: input.material,
      finishing: input.finishing,
      deadline: input.deadline,
      addonsTotal,
    });

    /** Único método ativo na loja: PIX com desconto fixo (ignora `paymentMethod` do cliente). */
    const valueTotal = applyPixDiscount(quote.total);

    const order = await withTransaction(async (client) => {
      const orderId = await ordersRepository.nextOrderId(client);
      const createdOrder = await ordersRepository.create(
        {
          id: orderId,
          clientId: user.id,
          productSlug: product.slug,
          productName: product.name,
          widthCm: input.width,
          heightCm: input.height,
          areaM2: quote.area,
          quantity: input.quantity,
          material: input.material,
          finishing: input.finishing,
          deadline: input.deadline,
          valueTotal,
          status: "novo",
          notes: input.notes?.trim() || null,
          cpf: input.cpf,
        },
        client,
      );

      if (!createdOrder) {
        throw new AppError("Não foi possível criar o pedido.", 500, "order_create_failed");
      }

      if (input.fileId) {
        const file = await filesRepository.findById(input.fileId, client);

        if (!file) {
          throw new AppError("Arquivo informado não foi encontrado.", 404, "file_not_found");
        }

        if (user.role !== "admin" && file.uploadedByUserId !== user.id) {
          throw new AppError("Arquivo não pertence ao usuário autenticado.", 403, "file_forbidden");
        }

        if (file.orderId && file.orderId !== createdOrder.id) {
          throw new AppError("Arquivo já está vinculado a outro pedido.", 409, "file_already_attached");
        }

        await filesRepository.attachToOrder(file.id, createdOrder.id, client);
      }

      await ordersRepository.createStatusHistory(
        {
          orderId: createdOrder.id,
          fromStatus: null,
          toStatus: "novo",
          changedByUserId: user.id,
          note: "Pedido criado",
        },
        client,
      );

      await ordersRepository.createAuditLog(
        {
          orderId: createdOrder.id,
          action: "order_created",
          actorUserId: user.id,
          payload: {
            productSlug: input.productSlug,
            quantity: input.quantity,
            value: valueTotal,
            quoteFull: quote.total,
            paymentMethod: "pix",
          },
        },
        client,
      );

      return ordersRepository.findById(createdOrder.id, client);
    });

    if (!order) {
      throw new AppError("Não foi possível carregar o pedido criado.", 500, "order_load_failed");
    }

    logger.info("Pedido criado", { orderId: order.id, actorUserId: user.id });
    return order;
  },

  async updateStatus(orderId: string, rawInput: UpdateOrderStatusInput, user: SessionUser) {
    if (user.role !== "admin") {
      throw new AppError("Somente o admin pode alterar status.", 403, "admin_only");
    }

    const input = updateOrderStatusSchema.parse(rawInput);
    const currentOrder = await ordersRepository.findById(orderId);

    if (!currentOrder) {
      throw new AppError("Pedido não encontrado.", 404, "order_not_found");
    }

    if (currentOrder.status === input.status) {
      return currentOrder;
    }

    const updatedOrder = await withTransaction(async (client) => {
      await ordersRepository.updateStatus(orderId, input.status, client);
      await ordersRepository.createStatusHistory(
        {
          orderId,
          fromStatus: currentOrder.status,
          toStatus: input.status,
          changedByUserId: user.id,
          note: input.note?.trim() || null,
        },
        client,
      );
      await ordersRepository.createAuditLog(
        {
          orderId,
          action: "status_updated",
          actorUserId: user.id,
          payload: {
            fromStatus: currentOrder.status,
            toStatus: input.status,
            note: input.note?.trim() || null,
          },
        },
        client,
      );
      return ordersRepository.findById(orderId, client);
    });

    if (!updatedOrder) {
      throw new AppError("Falha ao atualizar pedido.", 500, "order_update_failed");
    }

    logger.info("Status do pedido atualizado", {
      orderId,
      fromStatus: currentOrder.status,
      toStatus: input.status,
      actorUserId: user.id,
    });

    return updatedOrder;
  },

  async updateAdminNotes(orderId: string, adminNotes: string | null, user: SessionUser) {
    if (user.role !== "admin") {
      throw new AppError("Somente o admin pode editar observações internas.", 403, "admin_only");
    }

    const current = await ordersRepository.findById(orderId);
    if (!current) {
      throw new AppError("Pedido não encontrado.", 404, "order_not_found");
    }

    const normalized = adminNotes?.trim() ? adminNotes.trim() : null;

    await withTransaction(async (client) => {
      await ordersRepository.updateAdminNotes(orderId, normalized, client);
      await ordersRepository.createAuditLog(
        {
          orderId,
          action: "admin_notes_updated",
          actorUserId: user.id,
          payload: { length: normalized?.length ?? 0 },
        },
        client,
      );
    });

    const updated = await ordersRepository.findById(orderId);
    if (!updated) {
      throw new AppError("Falha ao atualizar pedido.", 500, "order_update_failed");
    }
    return updated;
  },
};
