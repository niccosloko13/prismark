export interface ElectionMaterial {
  name: string;
  slug: string;
  sizeNote: string;
  subtitle: string;
  image: string;
}

export const ELECTION_MATERIALS: ElectionMaterial[] = [
  {
    name: "Santinho",
    slug: "folheto",
    sizeNote: "7×10cm",
    subtitle: "Divulgação em massa",
    image: "/product/folheto/folheto.png",
  },
  {
    name: "Santão",
    slug: "folheto",
    sizeNote: "10×15cm",
    subtitle: "Grande formato",
    image: "/product/folheto/folheto.png",
  },
  {
    name: "Praguinha",
    slug: "adesivo",
    sizeNote: "7×7cm",
    subtitle: "Para postes e ruas",
    image: "/product/adesivo/adesivo1.jpg",
  },
  {
    name: "Pragão",
    slug: "adesivo",
    sizeNote: "9×9cm",
    subtitle: "Impacto máximo",
    image: "/product/adesivo/adesivo1.jpg",
  },
  {
    name: "Bandeiras",
    slug: "lona",
    sizeNote: "1,40×2,00m",
    subtitle: "Personalizadas",
    image: "/product/lona/lona.png",
  },
  {
    name: "Folder",
    slug: "folder",
    sizeNote: "Padrão A4/A5",
    subtitle: "Informação completa",
    image: "/product/folder/folder.png",
  },
  {
    name: "Windbanner",
    slug: "wind-banner",
    sizeNote: "1,80×3,50m",
    subtitle: "Resistente ao vento",
    image: "/product/windbanner/windbanner.png",
  },
  {
    name: "Banner tecido",
    slug: "banner-tecido",
    sizeNote: "Sob medida",
    subtitle: "Alta durabilidade",
    image: "/product/banner/banner1.png",
  },
  {
    name: "Cartão de visita",
    slug: "cartao",
    sizeNote: "9×5cm",
    subtitle: "Identidade profissional",
    image: "/product/cartãodevisita/cartaodevisita.png",
  },
  {
    name: "Adesivo perfurado",
    slug: "adesivo-perfurado",
    sizeNote: "40×70cm",
    subtitle: "Visão por dentro",
    image: "/product/adesivo%20perfurado/adesivo%20perfurado.png",
  },
  {
    name: "Adesivo para-choque",
    slug: "adesivo",
    sizeNote: "10×30cm",
    subtitle: "Cola forte",
    image: "/product/adesivo/adesivo2.webp",
  },
  {
    name: "Jornal",
    slug: "folheto",
    sizeNote: "29,7×42cm",
    subtitle: "Formato A3",
    image: "/product/folheto/folheto.png",
  },
];
