import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError, isAppError } from "@/server/errors/app-error";
import { logger } from "@/server/services/logger";

export async function withController<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Dados inválidos.",
        code: "validation_error",
        details: error.flatten(),
      },
      { status: 400 },
    );
  }

  if (isAppError(error)) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode },
    );
  }

  logger.error("Erro não tratado no controller", {
    error: error instanceof Error ? error.message : String(error),
  });

  return NextResponse.json(
    {
      message: "Erro interno do servidor.",
      code: "internal_error",
    },
    { status: 500 },
  );
}
