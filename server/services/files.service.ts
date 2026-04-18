import crypto from "node:crypto";
import path from "node:path";

import { env } from "@/server/config/env";
import { AppError } from "@/server/errors/app-error";
import { filesRepository } from "@/server/repositories/files.repository";
import { ordersRepository } from "@/server/repositories/orders.repository";
import { getStorageProvider } from "@/server/services/storage/storage-provider";
import { validateUploadFile } from "@/server/validation/files";
import { slugifyFilename } from "@/lib/utils";
import type { SessionUser } from "@/types";

const storageProvider = getStorageProvider();

export const filesService = {
  async uploadForUser(user: SessionUser, file: File) {
    const { mimeType } = validateUploadFile(file);
    const safeName = slugifyFilename(file.name);
    const storedName = `${crypto.randomUUID()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const savedFile = await storageProvider.save(buffer, storedName);

    try {
      return await filesRepository.create({
        uploadedByUserId: user.id,
        originalName: file.name,
        storedName: savedFile.storedName,
        storageDriver: env.STORAGE_DRIVER,
        relativePath: savedFile.relativePath,
        mimeType,
        sizeBytes: file.size,
      });
    } catch (error) {
      await storageProvider.remove(savedFile.relativePath);
      throw error;
    }
  },

  async findAccessibleFile(identifier: string, user: SessionUser) {
    const file = await filesRepository.findByIdentifier(identifier);

    if (!file) {
      throw new AppError("Arquivo não encontrado.", 404, "file_not_found");
    }

    if (user.role === "admin") {
      return file;
    }

    if (!file.orderId && file.uploadedByUserId === user.id) {
      return file;
    }

    if (!file.orderId) {
      throw new AppError("Acesso negado ao arquivo.", 403, "file_forbidden");
    }

    const order = await ordersRepository.findById(file.orderId);

    if (!order || order.clientId !== user.id) {
      throw new AppError("Acesso negado ao arquivo.", 403, "file_forbidden");
    }

    return file;
  },

  async readFileContent(relativePath: string) {
    const normalizedPath = relativePath.replace(/\\/g, "/");
    const extension = path.extname(normalizedPath).toLowerCase();
    const buffer = await storageProvider.read(normalizedPath);
    return { buffer, extension };
  },
};
