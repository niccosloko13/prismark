/**
 * Validação do BR Code: CRC e estrutura mínima do payload.
 * Rode: npx tsx lib/pix/br-code.test.ts
 */
import assert from "node:assert/strict";

import { buildMerchantAccountInfoField26, crc16, formatEmvField, generateStaticPixPayload, sanitizePixText } from "./br-code";

function assertPayloadValid(payload: string) {
  assert.match(payload, /^000201/, "deve iniciar com Payload Format Indicator 000201");
  assert.ok(payload.includes("br.gov.bcb.pix"), "GUI deve ser br.gov.bcb.pix (minúsculo)");
  assert.ok(payload.includes("010211"), "campo 01 (Point of Initiation) = 11 estático");
  assert.match(payload, /6304[0-9A-F]{4}$/, "deve terminar com 6304 + CRC hex");

  const body = payload.slice(0, -4);
  const crcAppended = payload.slice(-4);
  assert.equal(crc16(body), crcAppended, "CRC16 deve fechar o payload até 6304 inclusive");
}

assert.equal(formatEmvField("00", "01"), "000201");

{
  const { field26, merchantAccountInfoValue } = buildMerchantAccountInfoField26("12345678901");
  assert.ok(field26.startsWith("26"), "campo 26 deve iniciar com id 26");
  const l = Number.parseInt(field26.slice(2, 4), 10);
  assert.equal(l, merchantAccountInfoValue.length, "tamanho declarado no 26 = len do valor concatenado");
  assert.equal(field26.length, 4 + merchantAccountInfoValue.length, "TLV 26 = 4 + comprimento do valor");
}

assert.equal(sanitizePixText("São Bernardo", 15), "SAO BERNARDO");

const sample = generateStaticPixPayload({
  key: "12345678901",
  keyType: "CPF",
  merchantName: "PRISMARQ COMUNICACAO",
  merchantCity: "SAO BERNARDO",
  amount: 159.73,
  txid: "PEDIDO123ABC",
});

assertPayloadValid(sample);
assert.ok(sample.includes("5406159.73"), "campo 54 com valor 159.73 (ponto decimal)");

const withPhone = generateStaticPixPayload({
  key: "11988887777",
  keyType: "PHONE",
  merchantName: "LOJA TESTE",
  merchantCity: "SAO PAULO",
  amount: 10,
  txid: "TX123",
});
assert.ok(withPhone.includes("5511988887777"), "telefone com DDI 55");

assertPayloadValid(withPhone);

console.log("lib/pix/br-code.test.ts — OK");
