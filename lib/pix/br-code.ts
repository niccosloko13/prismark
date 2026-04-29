/**
 * BR Code (Pix copia e cola) — estrutura EMV conforme padrão Bacen / EMVCo para Pix.
 * Referência: Manual de Padrões para Iniciação do Pix (QR estático).
 */

import type { PixKeyType } from "@/types";

const GUI_PIX = "br.gov.bcb.pix";
const PAYLOAD_FORMAT = "01";
const POINT_OF_INITIATION_STATIC = "11";
const MCC_NOT_SPECIFIED = "0000";
const CURRENCY_BRL = "986";
const COUNTRY_BR = "BR";
const CRC_ID = "63";
const CRC_PLACEHOLDER_LEN = "04";

const MAX_MERCHANT_NAME = 25;
const MAX_MERCHANT_CITY = 15;
const MAX_TXID_REF = 25;
const MAX_DESCRIPTION_GUI = 25;

/** Remove acentos e caracteres fora do conjunto seguro para nome/cidade Pix (ASCII imprimível). */
export function sanitizePixText(value: string, maxLength: number): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  return cleaned.slice(0, maxLength);
}

/** TLV: id (2) + tamanho (2 decimais) + valor. Valor ≤ 99 caracteres (2 dígitos de comprimento). */
export function formatEmvField(id: string, value: string): string {
  if (!/^\d{2}$/.test(id)) {
    throw new Error(`EMV: id inválido "${id}"`);
  }
  if (value.length > 99) {
    throw new Error(`EMV: valor excede 99 caracteres no campo ${id}`);
  }
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

/**
 * CRC16-CCITT-FALSE (polinômio 0x1021, valor inicial 0xFFFF), como especificado para o campo 63 do Pix.
 * Calculado sobre todos os bytes do payload incluindo "6304", excluindo apenas os 4 hex finais do CRC.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normaliza chave Pix para o subcampo 01 do GUI (formato esperado pelo arranjo). */
export function sanitizePixKey(rawKey: string, keyType?: PixKeyType | null): string {
  const key = rawKey.trim();
  if (!key) {
    throw new Error("Chave Pix vazia.");
  }

  const digits = onlyDigits(key);

  if (keyType === "EMAIL" || key.includes("@")) {
    return key.toLowerCase();
  }

  if (keyType === "PHONE") {
    if (digits.length === 11) {
      return `+55${digits}`;
    }
    if (digits.length === 13 && digits.startsWith("55")) {
      return `+${digits}`;
    }
    if (key.startsWith("+")) {
      return `+${digits}`;
    }
    return digits.length > 0 ? `+${digits}` : key;
  }

  if (keyType === "CPF" || keyType === "CNPJ") {
    return digits;
  }

  if (keyType === "RANDOM") {
    return key.trim();
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    return key.trim();
  }

  if (digits.length === 14) {
    return digits;
  }

  if (digits.length === 11) {
    return digits;
  }

  if (digits.length === 10) {
    return `+55${digits}`;
  }

  return key;
}

function sanitizeTxid(raw: string): string {
  const t = raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, MAX_TXID_REF);
  if (!t) {
    throw new Error("TXID de referência inválido após sanitização.");
  }
  return t;
}

function formatAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor Pix deve ser um número positivo.");
  }
  return amount.toFixed(2);
}

export type StaticPixPayloadInput = {
  key: string;
  keyType?: PixKeyType | null;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
  /** Opcional; máx. 25 caracteres após sanitização (subcampo 02 do GUI). */
  description?: string;
};

const FALLBACK_MERCHANT_NAME = "PRISMARQ COMUNICACAO";
const FALLBACK_MERCHANT_CITY = "SAO BERNARDO";

/** Valor máximo do conteúdo interno do campo 26 (sub-TLVs concatenados), 2 dígitos de comprimento no EMV. */
const MAX_MERCHANT_ACCOUNT_INFO_VALUE_LEN = 99;

/**
 * Merchant Account Information (campo 26): sub-TLVs 00 (GUI) e 01 (chave), opcional 02.
 * O comprimento do campo 26 é sempre derivado do tamanho real de `merchantAccountInfoValue` via formatEmvField.
 */
export function buildMerchantAccountInfoField26(
  pixKey: string,
  description?: string,
): { field26: string; merchantAccountInfoValue: string } {
  const gui = formatEmvField("00", GUI_PIX);
  const key = formatEmvField("01", pixKey);
  let merchantAccountInfoValue = gui + key;

  if (description?.trim()) {
    const desc = sanitizePixText(description, MAX_DESCRIPTION_GUI);
    if (desc) {
      merchantAccountInfoValue += formatEmvField("02", desc);
    }
  }

  if (merchantAccountInfoValue.length > MAX_MERCHANT_ACCOUNT_INFO_VALUE_LEN) {
    throw new Error(
      `EMV: conteúdo do campo 26 excede ${MAX_MERCHANT_ACCOUNT_INFO_VALUE_LEN} caracteres (${merchantAccountInfoValue.length}). Reduza chave ou descrição.`,
    );
  }

  const field26 = formatEmvField("26", merchantAccountInfoValue);

  if (process.env.NODE_ENV === "development") {
    const declaredLen = Number.parseInt(field26.slice(2, 4), 10);
    const expectedTotalFieldLen = 4 + merchantAccountInfoValue.length;
    console.info("[pix EMV campo 26]", {
      merchantAccountInfoValueLength: merchantAccountInfoValue.length,
      campo26_declaredValueLength: declaredLen,
      lengthsMatch: declaredLen === merchantAccountInfoValue.length,
      campo26_totalChars: field26.length,
      campo26_expectedTotalChars: expectedTotalFieldLen,
      totalMatches: field26.length === expectedTotalFieldLen,
    });
  }

  return { field26, merchantAccountInfoValue };
}

/**
 * Monta o payload EMV completo (Pix copia e cola) para QR estático com valor fixo.
 * Ordem dos IDs: 00, 01, 26, 52, 53, 54, 58, 59, 60, 62, 63.
 */
export function generateStaticPixPayload(input: StaticPixPayloadInput): string {
  const pixKey = sanitizePixKey(input.key, input.keyType);
  const merchantName =
    sanitizePixText(input.merchantName, MAX_MERCHANT_NAME) || FALLBACK_MERCHANT_NAME;
  const merchantCity =
    sanitizePixText(input.merchantCity, MAX_MERCHANT_CITY) || FALLBACK_MERCHANT_CITY;
  const txid = sanitizeTxid(input.txid);
  const amountStr = formatAmount(input.amount);

  const { field26: merchantAccount, merchantAccountInfoValue } = buildMerchantAccountInfoField26(
    pixKey,
    input.description,
  );
  const additionalData = formatEmvField("62", formatEmvField("05", txid));

  const payloadHeader =
    formatEmvField("00", PAYLOAD_FORMAT) + formatEmvField("01", POINT_OF_INITIATION_STATIC);

  const withoutCrc =
    payloadHeader +
    merchantAccount +
    formatEmvField("52", MCC_NOT_SPECIFIED) +
    formatEmvField("53", CURRENCY_BRL) +
    formatEmvField("54", amountStr) +
    formatEmvField("58", COUNTRY_BR) +
    formatEmvField("59", merchantName) +
    formatEmvField("60", merchantCity) +
    additionalData +
    CRC_ID +
    CRC_PLACEHOLDER_LEN;

  const payload = `${withoutCrc}${crc16(withoutCrc)}`;

  if (process.env.NODE_ENV === "development") {
    const offset26 = payloadHeader.length;
    const slice26 = withoutCrc.slice(offset26, offset26 + merchantAccount.length);
    const decl = Number.parseInt(merchantAccount.slice(2, 4), 10);
    console.info("[pix EMV payload checksum]", {
      payloadLength: payload.length,
      campo26_igual_ao_esperado: slice26 === merchantAccount,
      campo26_valor_bate_com_declarado: decl === merchantAccountInfoValue.length,
      soma_chars_sem_crc: withoutCrc.length,
    });
  }

  return payload;
}

/** Em desenvolvimento, registra o payload (sem expor em produção por padrão). */
export function logPixPayloadDev(payload: string, log: (msg: string, meta: Record<string, string>) => void): void {
  if (process.env.NODE_ENV === "development") {
    log("pix_emv_payload", { length: String(payload.length), payload });
  }
}
