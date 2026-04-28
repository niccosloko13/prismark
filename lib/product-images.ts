import webpManifest from "./product-webp-manifest.json";

const productImagePathsBySlug: Record<string, string[]> = {
  banner: [
    "/images/products/banner/banner1.png",
    "/images/products/banner/banner2.webp",
    "/images/products/banner/banner3.png",
    "/images/products/banner/banner4.png",
  ],
  faixa: [
    "/images/products/faixa/faixa-01.jpg",
    "/images/products/faixa/faixa-02.jpg",
    "/images/products/faixa/faixa-03.jpg",
  ],
  adesivo: [
    "/images/products/adesivo/adesivo-01.jpg",
    "/images/products/adesivo/adesivo-02.jpg",
    "/images/products/adesivo/adesivo-03.jpg",
  ],
  cartao: [
    "/images/products/cartao-de-visita/cartao-de-visita-01.jpg",
    "/images/products/cartao-de-visita/cartao-de-visita-02.jpg",
    "/images/products/cartao-de-visita/cartao-de-visita-03.jpg",
  ],
  lona: [
    "/images/products/lona/lona-01.jpg",
    "/images/products/lona/lona-02.jpg",
    "/images/products/lona/lona-03.jpg",
  ],
  "wind-banner": [
    "/images/products/wind-banner/windbanner.png",
    "/images/products/wind-banner/windbanner2.png",
    "/images/products/wind-banner/basewindbanner.webp",
    "/images/products/wind-banner/hastewindbanner.webp",
  ],
  "placa-pvc": [
    "/images/products/placa-pvc/placa-pvc-01.jpg",
    "/images/products/placa-pvc/placa-pvc-02.jpg",
    "/images/products/placa-pvc/placa-pvc-03.jpg",
  ],
  "placa-acm": [
    "/images/products/placa-acm/placa-acm-01.jpg",
    "/images/products/placa-acm/placa-acm-02.jpg",
    "/images/products/placa-acm/placa-acm-03.jpg",
  ],
  backdrop: ["/images/products/backdrop/backdrop1.png"],
  "backdrop-tecido": ["/images/products/bakdropemtecido/backdroptecido1.png"],
  "banner-tecido": ["/images/products/banner-em-tecido/backdroptecido1.png"],
  folheto: [
    "/images/products/folheto/folheto-01.jpg",
    "/images/products/folheto/folheto-02.jpg",
    "/images/products/folheto/folheto-03.jpg",
  ],
  "adesivo-perfurado": [
    "/images/products/adesivo-perfurado/adesivo-perfurado-01.jpg",
    "/images/products/adesivo-perfurado/adesivo-perfurado-02.jpg",
    "/images/products/adesivo-perfurado/adesivo-perfurado-03.jpg",
  ],
  totem: [
    "/images/products/totem/totem-01.jpg",
    "/images/products/totem/totem-02.jpg",
    "/images/products/totem/totem-03.png",
  ],
  folder: [
    "/images/products/folder/folder-01.jpg",
    "/images/products/folder/folder-02.jpg",
    "/images/products/folder/folder-03.jpg",
  ],
  "faixa-impressa": [
    "/images/products/faixa-impressa/faixa-impressa-01.jpg",
    "/images/products/faixa-impressa/faixa-impressa-02.jpg",
    "/images/products/faixa-impressa/faixa-impressa-03.jpg",
  ],
};

export function getProductImagePaths(slug: string) {
  return productImagePathsBySlug[slug] ?? [];
}

export function getProductPrimaryImagePath(slug: string) {
  return getProductImagePaths(slug)[0] ?? null;
}

/**
 * URLs na ordem de preferência do navegador: WebP (mesmo stem) e depois o arquivo catalogado (jpg/jpeg/png).
 * Data URLs e SVG não são alterados.
 */
export function getPublicImageSrcCandidates(canonicalPath: string): string[] {
  if (!canonicalPath) {
    return [];
  }
  if (canonicalPath.startsWith("data:")) {
    return [canonicalPath];
  }
  const lower = canonicalPath.toLowerCase();
  if (lower.endsWith(".svg")) {
    return [canonicalPath];
  }
  const match = canonicalPath.match(/^(.*)\.([^.]+)$/);
  if (!match) {
    return [canonicalPath];
  }
  const stem = match[1];
  const ext = match[2].toLowerCase();
  if (ext === "webp") {
    return [canonicalPath];
  }
  const webpPath = `${stem}.webp`;
  if (Object.prototype.hasOwnProperty.call(webpManifest, webpPath)) {
    return [webpPath, canonicalPath];
  }
  return [canonicalPath];
}
