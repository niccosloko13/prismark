/**
 * Validação da chave Pix no admin: tipo deve corresponder ao formato da chave cadastrada.
 */

import type { PixKeyType } from "@/types";

import { sanitizePixKey } from "./br-code";

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

const EMAIL_RE = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

/** UUID v4 (chave aleatória EVP), aceita qualquer capitalização; retorno mantém o texto trimado original. */
const RANDOM_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PixKeyValidationResult =
  | { ok: true; sanitizedKey: string }
  | { ok: false; message: string };

/**
 * Valida e retorna a chave no formato esperado pelo BR Code (subcampo 01).
 * CPF/CNPJ: só dígitos. Telefone: +55DDD+número. E-mail: minúsculo e formato válido. Aleatória: UUID v4, string exata (trim).
 */
function validatePixKeyForType(pixKey: string, pixKeyType: PixKeyType): PixKeyValidationResult {
  const raw = pixKey.trim();
  if (!raw) {
    return { ok: false, message: "Informe a chave Pix." };
  }

  const digits = onlyDigits(raw);

  switch (pixKeyType) {
    case "CPF": {
      if (/[a-zA-Z]/.test(raw)) {
        return { ok: false, message: "CPF não deve conter letras." };
      }
      if (digits.length !== 11) {
        return { ok: false, message: "CPF deve conter exatamente 11 dígitos." };
      }
      return { ok: true, sanitizedKey: digits };
    }
    case "CNPJ": {
      if (/[a-zA-Z]/.test(raw)) {
        return { ok: false, message: "CNPJ não deve conter letras." };
      }
      if (digits.length !== 14) {
        return { ok: false, message: "CNPJ deve conter exatamente 14 dígitos." };
      }
      return { ok: true, sanitizedKey: digits };
    }
    case "PHONE": {
      let sanitized: string;
      try {
        sanitized = sanitizePixKey(raw, "PHONE");
      } catch {
        return { ok: false, message: "Telefone inválido." };
      }
      if (!/^\+55\d{10,11}$/.test(sanitized)) {
        return {
          ok: false,
          message:
            "Telefone celular/fixo: informe DDD + número (10 ou 11 dígitos após o DDD). Ex.: 11999998888 ou +5511999998888. O sistema grava como +55...",
        };
      }
      return { ok: true, sanitizedKey: sanitized };
    }
    case "EMAIL": {
      const lower = raw.toLowerCase().trim();
      if (!EMAIL_RE.test(lower)) {
        return { ok: false, message: "E-mail inválido. Use um endereço válido (será salvo em minúsculas)." };
      }
      return { ok: true, sanitizedKey: lower };
    }
    case "RANDOM": {
      if (!RANDOM_UUID_RE.test(raw)) {
        return {
          ok: false,
          message: "Chave aleatória deve ser um UUID v4 (formato xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx).",
        };
      }
      return { ok: true, sanitizedKey: raw };
    }
    default:
      return { ok: false, message: "Tipo de chave Pix inválido." };
  }
}

/** Validação completa para salvar no admin: tipo × formato e regras do arranjo. */
export function validateAdminPixKey(pixKey: string, pixKeyType: PixKeyType): PixKeyValidationResult {
  const digits = onlyDigits(pixKey);
  if (pixKeyType === "CPF" && digits.length === 14) {
    return { ok: false, message: "Tipo CPF selecionado, mas a chave tem 14 dígitos (parece CNPJ). Ajuste o tipo ou a chave." };
  }
  if (pixKeyType === "CNPJ" && digits.length === 11 && !pixKey.includes("@")) {
    return { ok: false, message: "Tipo CNPJ selecionado, mas a chave tem 11 dígitos (parece CPF). Ajuste o tipo ou a chave." };
  }
  return validatePixKeyForType(pixKey, pixKeyType);
}
