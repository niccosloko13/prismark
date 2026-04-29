import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { usersRepository } from "@/server/repositories/users.repository";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi(request);
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await context.params;
  const body = (await request.json()) as { isActive?: boolean };

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ message: "Informe isActive (boolean)." }, { status: 400 });
  }

  const target = await usersRepository.findById(id);
  if (!target) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  if (target.role === "admin" && body.isActive === false) {
    return NextResponse.json({ message: "Não é permitido desativar administradores por aqui." }, { status: 400 });
  }

  const user = await usersRepository.setIsActive(id, body.isActive);
  return NextResponse.json({ user });
}
