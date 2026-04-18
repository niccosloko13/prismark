import path from "node:path";
import { promises as fs } from "node:fs";

import { env } from "@/server/config/env";
import { AppError } from "@/server/errors/app-error";

export interface SavedStorageFile {
  storedName: string;
  relativePath: string;
}

export interface StorageProvider {
  save(buffer: Buffer, storedName: string): Promise<SavedStorageFile>;
  read(relativePath: string): Promise<Buffer>;
  remove(relativePath: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private baseDirectory = path.join(process.cwd(), env.UPLOAD_DIR);

  async save(buffer: Buffer, storedName: string): Promise<SavedStorageFile> {
    const now = new Date();
    const folder = path.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, "0"));
    const targetDirectory = path.join(this.baseDirectory, folder);
    const relativePath = path.join(folder, storedName);
    const absolutePath = path.join(this.baseDirectory, relativePath);

    await fs.mkdir(targetDirectory, { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    return {
      storedName,
      relativePath: relativePath.replace(/\\/g, "/"),
    };
  }

  async read(relativePath: string): Promise<Buffer> {
    return fs.readFile(path.join(this.baseDirectory, relativePath));
  }

  async remove(relativePath: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.baseDirectory, relativePath));
    } catch {
      // noop
    }
  }
}

class S3StorageProvider implements StorageProvider {
  async save(): Promise<never> {
    throw new AppError("Storage S3 ainda nao foi configurado nesta instalacao.", 500, "storage_not_ready");
  }

  async read(): Promise<never> {
    throw new AppError("Storage S3 ainda nao foi configurado nesta instalacao.", 500, "storage_not_ready");
  }

  async remove(): Promise<never> {
    throw new AppError("Storage S3 ainda nao foi configurado nesta instalacao.", 500, "storage_not_ready");
  }
}

export function getStorageProvider(): StorageProvider {
  if (env.STORAGE_DRIVER === "s3") {
    return new S3StorageProvider();
  }

  return new LocalStorageProvider();
}
