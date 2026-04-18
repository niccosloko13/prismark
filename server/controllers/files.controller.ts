import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { withController } from "@/server/controllers/controller-utils";
import { filesService } from "@/server/services/files.service";

const mimeByExtension: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".zip": "application/zip",
  ".ai": "application/postscript",
  ".cdr": "application/octet-stream",
};

export async function uploadFileController(request: NextRequest) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Faça login para enviar arquivos." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Nenhum arquivo recebido." }, { status: 400 });
    }

    const uploadedFile = await filesService.uploadForUser(session, file);
    return NextResponse.json({ file: uploadedFile }, { status: 201 });
  });
}

export async function downloadFileController(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  return withController(async () => {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ message: "Faça login para acessar arquivos." }, { status: 401 });
    }

    const { filename } = await context.params;
    const file = await filesService.findAccessibleFile(filename, session);

    if (!file.relativePath) {
      return NextResponse.json({ message: "Arquivo sem caminho associado." }, { status: 500 });
    }

    const { buffer, extension } = await filesService.readFileContent(file.relativePath);
    const contentType = file.mimeType || mimeByExtension[path.extname(file.storedName).toLowerCase()] || mimeByExtension[extension] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${file.originalName}"`,
      },
    });
  });
}
