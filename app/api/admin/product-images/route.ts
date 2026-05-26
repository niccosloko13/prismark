import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const PUBLIC_PREFIX = "/uploads/products";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Formulário inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Nenhum arquivo recebido." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "Arquivo excede 10 MB." }, { status: 413 });
  }
  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.includes(mime)) {
    return NextResponse.json({ message: "Use JPG, PNG ou WebP." }, { status: 415 });
  }

  const rawExt = path.extname(file.name).toLowerCase();
  const ext = rawExt || (mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg");
  const storedName = `${crypto.randomUUID()}${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `${PUBLIC_PREFIX}/${storedName}` }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const url = body.url ?? "";
  if (!url.startsWith(PUBLIC_PREFIX + "/")) {
    return NextResponse.json({ message: "URL inválida." }, { status: 400 });
  }

  const filename = path.basename(url);
  if (!filename || filename.includes("..")) {
    return NextResponse.json({ message: "Nome de arquivo inválido." }, { status: 400 });
  }

  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // already gone — ignore
  }

  return NextResponse.json({ ok: true });
}
