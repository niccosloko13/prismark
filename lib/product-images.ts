const productImagePathsBySlug: Record<string, string[]> = {
  banner: [
    "/images/products/banner/banner-01.jpg",
    "/images/products/banner/banner-02.jpg",
    "/images/products/banner/banner-03.jpg",
    "/images/products/banner/banner-04.jpg",
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
    "/images/products/wind-banner/wind-banner-01.jpg",
    "/images/products/wind-banner/wind-banner-02.jpg",
    "/images/products/wind-banner/wind-banner-03.png",
    "/images/products/wind-banner/wind-banner-04.jpg",
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
  backdrop: [
    "/images/products/backdrop/backdrop-01.jpg",
    "/images/products/backdrop/backdrop-02.jpg",
    "/images/products/backdrop/backdrop-03.jpg",
  ],
  "banner-tecido": [
    "/images/products/banner-em-tecido/banner-em-tecido-01.jpg",
    "/images/products/banner-em-tecido/banner-em-tecido-02.jpg",
    "/images/products/banner-em-tecido/banner-em-tecido-03.jpg",
  ],
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
