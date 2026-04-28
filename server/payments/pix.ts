import { formatCurrencyBRL } from "@/lib/utils";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalize(value: string, maxLength: number) {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .toUpperCase();

  if (!cleaned) {
    return "";
  }

  return cleaned.slice(0, maxLength);
}

function tlv(id: string, value: string) {
  const size = String(value.length).padStart(2, "0");
  return `${id}${size}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixTxid(seed: string) {
  const base = onlyDigits(seed).slice(-8) || Math.random().toString().slice(2, 10);
  const random = Math.random().toString(36).slice(2, 12).toUpperCase();
  return `${base}${random}`.slice(0, 25);
}

export function buildPixCopyPaste({
  pixKey,
  receiverName,
  receiverCity,
  amount,
  txid,
  description,
}: {
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  amount: number;
  txid: string;
  description?: string;
}) {
  const key = pixKey.trim();
  if (!key) {
    throw new Error("Chave Pix não configurada.");
  }

  const merchantName = normalize(receiverName, 25);
  const merchantCity = normalize(receiverCity, 15);
  const safeTxid = normalize(txid, 25) || "***";
  const amountValue = Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : "0.00";

  const merchantAccountInfo = tlv(
    "26",
    tlv("00", "BR.GOV.BCB.PIX") +
      tlv("01", key) +
      (description?.trim() ? tlv("02", normalize(description, 72)) : ""),
  );

  const additionalDataField = tlv("62", tlv("05", safeTxid));

  const withoutCrc =
    tlv("00", "01") +
    tlv("01", "12") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", amountValue) +
    tlv("58", "BR") +
    tlv("59", merchantName || "PRISMARQ") +
    tlv("60", merchantCity || "SAO PAULO") +
    additionalDataField +
    "6304";

  return `${withoutCrc}${crc16(withoutCrc)}`;
}

export function describePixAmount(amount: number) {
  return `Valor do pedido: ${formatCurrencyBRL(amount)}`;
}
