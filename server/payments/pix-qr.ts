import QRCode from "qrcode";

/** Gera data URL PNG do QR com o mesmo texto do Pix copia-e-cola (payload EMV). */
export async function generatePixQrDataUrl(pixCopyPaste: string): Promise<string> {
  return QRCode.toDataURL(pixCopyPaste, {
    width: 232,
    margin: 1,
    color: { dark: "#111111", light: "#FFFFFFFF" },
    type: "image/png",
    errorCorrectionLevel: "M",
  });
}
