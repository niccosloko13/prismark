export const companyProfile = {
  legalName: "PRISMARQ COMUNICAÇÃO VISUAL LTDA",
  brandName: "Prismarq Comunicação Visual",
  addressLine: "Rua José Bonifacio, 203 - Centro",
  cityState: "São Bernardo do Campo - SP",
  postalCode: "16430-057",
  phoneDisplay: "(11) 97410-0193",
  phoneDigits: "5511974100193",
  email: "contato@prismarqcomunicacao.com",
  shortTrustLine: "Produção própria, atendimento direto e impressão profissional.",
  supportLine: "Pedido online, sinalização, grandes formatos e comunicação visual com operação comercial real.",
} as const;

export const companyLinks = {
  phone: `tel:+${companyProfile.phoneDigits}`,
  email: `mailto:${companyProfile.email}`,
  whatsapp: `https://wa.me/${companyProfile.phoneDigits}?text=Olá%2C%20quero%20montar%20um%20pedido%20na%20Prismarq.`,
  mapsQuery: encodeURIComponent(
    `${companyProfile.addressLine}, ${companyProfile.cityState}, CEP ${companyProfile.postalCode}`,
  ),
} as const;

export const companyContactChannels = [
  {
    title: "WhatsApp comercial",
    value: companyProfile.phoneDisplay,
    href: companyLinks.whatsapp,
  },
  {
    title: "E-mail",
    value: companyProfile.email,
    href: companyLinks.email,
  },
  {
    title: "Telefone",
    value: companyProfile.phoneDisplay,
    href: companyLinks.phone,
  },
  {
    title: "Endereço",
    value: `${companyProfile.addressLine} • ${companyProfile.cityState}`,
    href: `https://www.google.com/maps/search/?api=1&query=${companyLinks.mapsQuery}`,
  },
] as const;

export const companyFooterLinks = [
  { label: "Produtos", href: "/products" },
  { label: "Pedido online", href: "/order" },
  { label: "Contato", href: "/contact" },
  { label: "Política de Privacidade", href: "/politica" },
] as const;
