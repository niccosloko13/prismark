import {
  generateStaticPixPayload,
  logPixPayloadDev,
  type StaticPixPayloadInput,
} from "@/lib/pix/br-code";
import type { PixKeyType } from "@/types";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

const TXID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generatePixTxid(seed: string) {
  const fromSeed = onlyDigits(seed).slice(-10);
  let out = "";
  for (let i = 0; i < fromSeed.length; i += 1) {
    out += TXID_ALPHABET[Number(fromSeed[i]) % TXID_ALPHABET.length];
  }
  while (out.length < 18) {
    out += TXID_ALPHABET[Math.floor(Math.random() * TXID_ALPHABET.length)];
  }
  return out.replace(/[^A-Z0-9]/g, "").slice(0, 25);
}

export function buildPixCopyPaste({
  pixKey,
  pixKeyType,
  receiverName,
  receiverCity,
  amount,
  txid,
  description,
}: {
  pixKey: string;
  pixKeyType?: PixKeyType | null;
  receiverName: string;
  receiverCity: string;
  amount: number;
  txid: string;
  description?: string;
}) {
  const input: StaticPixPayloadInput = {
    key: pixKey,
    keyType: pixKeyType,
    merchantName: receiverName,
    merchantCity: receiverCity,
    amount,
    txid,
    description,
  };

  const payload = generateStaticPixPayload(input);

  logPixPayloadDev(payload, (_msg, meta) => {
    console.info("[pix] EMV payload (dev)", meta);
  });

  return payload;
}
