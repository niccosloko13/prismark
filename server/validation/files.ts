import path from "node:path";

import { AppError } from "@/server/errors/app-error";
import { env } from "@/server/config/env";

export function validateUploadFile(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  const mimeType = (file.type || "application/octet-stream").toLowerCase();

  if (file.size <= 0) {
    throw new AppError("Nenhum arquivo recebido.", 400, "empty_file");
  }

  if (file.size > env.MAX_UPLOAD_BYTES) {
    throw new AppError("Arquivo excede o tamanho máximo permitido.", 413, "file_too_large", {
      maxBytes: env.MAX_UPLOAD_BYTES,
    });
  }

  if (!env.allowedUploadExtensions.includes(extension)) {
    throw new AppError("Extensão de arquivo não permitida.", 415, "invalid_file_extension", {
      extension,
    });
  }

  if (!env.allowedUploadMimeTypes.includes(mimeType)) {
    throw new AppError("Tipo de arquivo não permitido.", 415, "invalid_file_type", {
      mimeType,
    });
  }

  return {
    extension,
    mimeType,
  };
}
