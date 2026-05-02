import { NextRequest, NextResponse } from "next/server";

import { withController } from "@/server/controllers/controller-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { ordersService } from "@/server/services/orders.service";
import type { StoredFile, UpdateOrderStatusInput } from "@/types";

export async function listOrdersController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const orders = await ordersService.listForSession(session);
    return NextResponse.json({ orders });
  });
}

export async function createOrderController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Faça login para criar um pedido." }, { status: 401 });
    }

    const body = (await request.json()) as {
      productSlug?: string;
      width?: number;
      height?: number;
      quantity?: number;
      material?: string;
      finishing?: string;
      deadline?: string;
      selectedAddonIds?: string[];
      notes?: string;
      cpf?: string;
      fileId?: string | null;
      file?: StoredFile | null;
      paymentMethod?: "pix" | "card";
    };

    const order = await ordersService.create(
      {
        productSlug: body.productSlug ?? "",
        width: Number(body.width ?? 0),
        height: Number(body.height ?? 0),
        quantity: Number(body.quantity ?? 0),
        material: body.material ?? "",
        finishing: body.finishing ?? "",
        deadline: body.deadline ?? "",
        cpf: body.cpf ?? "",
        selectedAddonIds: Array.isArray(body.selectedAddonIds) ? body.selectedAddonIds : undefined,
        notes: body.notes,
        fileId: body.fileId ?? body.file?.id ?? null,
        paymentMethod: body.paymentMethod,
      },
      session,
    );

    return NextResponse.json({ order }, { status: 201 });
  });
}

export async function getOrderController(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const { id } = await context.params;
    const order = await ordersService.findOneForSession(id, session);
    return NextResponse.json({ order });
  });
}

export async function updateOrderStatusController(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Sessão não encontrada." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      status?: string;
      note?: string;
      adminNotes?: string | null;
    };

    if (body.adminNotes !== undefined && body.status === undefined) {
      const order = await ordersService.updateAdminNotes(id, body.adminNotes ?? null, session);
      return NextResponse.json({ order });
    }

    const order = await ordersService.updateStatus(
      id,
      {
        status: String(body.status ?? "") as UpdateOrderStatusInput["status"],
        note: body.note,
      },
      session,
    );

    return NextResponse.json({ order });
  });
}
