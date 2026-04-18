import { buildProductConfiguration } from "@/lib/product-configuration";
import type { Product, ProductConfiguration } from "@/types";

const fastLane = [
  { label: "Expresso · 2 dias", days: 2, multiplier: 1.22 },
  { label: "Standard · 4 dias", days: 4, multiplier: 1 },
  { label: "Planejado · 6 dias", days: 6, multiplier: 0.92 },
];

const rigidLane = [
  { label: "Expresso · 3 dias", days: 3, multiplier: 1.18 },
  { label: "Standard · 5 dias", days: 5, multiplier: 1 },
  { label: "Planejado · 7 dias", days: 7, multiplier: 0.94 },
];

const paperLane = [
  { label: "Expresso · 1 dia", days: 1, multiplier: 1.18 },
  { label: "Standard · 3 dias", days: 3, multiplier: 1 },
  { label: "Planejado · 5 dias", days: 5, multiplier: 0.92 },
];

export const products: Product[] = [
  {
    slug: "banner",
    name: "Banner",
    category: "Grande Formato",
    badge: "Mais vendido",
    description:
      "Banner promocional com leitura forte para lojas, feiras, PDV e campanhas de curta ou media duracao.",
    lead: "Fluxo rapido para quem precisa personalizar, enviar a arte e fechar o pedido com acabamento pronto para uso.",
    basePriceM2: 86,
    minimumArea: 0.5,
    minQuantity: 1,
    materials: [
      {
        label: "Lona brilho 340g",
        multiplier: 1,
        description: "Opcao mais comercial para cores intensas e leitura de impacto.",
      },
      {
        label: "Lona fosca 340g",
        multiplier: 1.08,
        description: "Reduz reflexo e melhora a leitura em ambientes internos iluminados.",
      },
      {
        label: "Lona blackout 440g",
        multiplier: 1.18,
        description: "Mais corpo, opacidade e estabilidade para campanhas exigentes.",
      },
    ],
    finishings: [
      {
        label: "Ilhós reforçado",
        fee: 28,
        type: "perOrder",
        description: "Fixacao pratica para lojas, eventos e estrutura tubular.",
      },
      {
        label: "Bastão e cordão",
        fee: 38,
        type: "perOrder",
        description: "Acabamento pronto para exibir em vitrine, auditório e recepcao.",
      },
      {
        label: "Refilado",
        fee: 0,
        type: "perOrder",
        description: "Corte limpo para quem ja possui acessorio ou estrutura.",
      },
    ],
    deadlines: fastLane,
    applications: ["Eventos", "PDV", "Lojas"],
    deliveryNote: "Entrega enrolada com protecao de borda para preservar a impressao.",
    featured: true,
  },
  {
    slug: "faixa",
    name: "Faixa",
    category: "Grande Formato",
    badge: "Campanha rapida",
    description:
      "Faixa promocional horizontal para fachadas, campanhas de rua e comunicacao sazonal com leitura a distancia.",
    lead: "Boa opcao para mensagem direta, alto impacto comercial e instalacao objetiva.",
    basePriceM2: 74,
    minimumArea: 0.7,
    minQuantity: 1,
    materials: [
      {
        label: "Lona frontlight 440g",
        multiplier: 1,
        description: "Base equilibrada para uso promocional interno ou externo.",
      },
      {
        label: "Lona blackout 440g",
        multiplier: 1.15,
        description: "Melhor opacidade para fachadas e pontos com luz de fundo.",
      },
      {
        label: "Lona mesh",
        multiplier: 1.24,
        description: "Reduz impacto do vento em areas abertas e instalacoes maiores.",
      },
    ],
    finishings: [
      {
        label: "Bastão e corda",
        fee: 44,
        type: "perOrder",
        description: "Solucao classica para amarracao rapida e boa tensao.",
      },
      {
        label: "Ilhós reforçado",
        fee: 30,
        type: "perOrder",
        description: "Acabamento metalico distribuido nas extremidades.",
      },
      {
        label: "Barra soldada",
        fee: 24,
        type: "perOrder",
        description: "Melhora a resistencia em pecas com largura maior.",
      },
    ],
    deadlines: fastLane,
    applications: ["Fachada", "Rua", "Promocao"],
    deliveryNote: "Embalagem enrolada para reduzir marcas de transporte.",
    featured: true,
  },
  {
    slug: "adesivo",
    name: "Adesivo",
    category: "Adesivos e Aplicação",
    badge: "PDV e vitrine",
    description:
      "Adesivos para vitrine, ambientacao, promocao e sinalizacao com impressao limpa e acabamento tecnico.",
    lead: "Pensado para pontos de venda, paredes, embalagens e acoes visuais de curta ou media duracao.",
    basePriceM2: 118,
    minimumArea: 0.25,
    minQuantity: 1,
    materials: [
      {
        label: "Vinil fosco",
        multiplier: 1,
        description: "Visual elegante com menos reflexo e boa leitura de perto.",
      },
      {
        label: "Vinil brilho",
        multiplier: 1.08,
        description: "Mais contraste para campanhas promocionais e vitrine.",
      },
      {
        label: "Vinil high tack",
        multiplier: 1.18,
        description: "Adesao reforcada para superficies mais exigentes.",
      },
    ],
    finishings: [
      {
        label: "Laminação fosca",
        fee: 18,
        type: "perUnit",
        description: "Protege a impressao e reduz reflexo na superficie.",
      },
      {
        label: "Laminação brilho",
        fee: 18,
        type: "perUnit",
        description: "Realca cor e brilho para pecas promocionais.",
      },
      {
        label: "Recorte especial",
        fee: 26,
        type: "perUnit",
        description: "Contorno personalizado para formas e logos.",
      },
    ],
    deadlines: fastLane,
    applications: ["Vitrine", "Sinalizacao", "Ambientacao"],
    deliveryNote: "Envio plano ou enrolado conforme o formato final.",
    featured: true,
  },
  {
    slug: "cartao",
    name: "Cartão de visita",
    category: "Papelaria Promocional",
    badge: "Acabamento fino",
    description:
      "Cartoes de visita com impressao refinada, boa gramatura e acabamentos pensados para apresentacao de marca.",
    lead: "Uma linha comercial para networking, equipes, representantes e marcas que precisam de boa primeira impressao.",
    basePriceM2: 720,
    minimumArea: 0.03,
    minQuantity: 100,
    materials: [
      {
        label: "Couchê 300g",
        multiplier: 1,
        description: "Papel classico com boa presenca e custo controlado.",
      },
      {
        label: "Supremo 350g",
        multiplier: 1.16,
        description: "Maior rigidez para um toque mais premium na entrega.",
      },
      {
        label: "Kraft 300g",
        multiplier: 1.22,
        description: "Visual autoral para marcas com proposta mais criativa.",
      },
    ],
    finishings: [
      {
        label: "Corte reto",
        fee: 0,
        type: "perOrder",
        description: "Acabamento padrao com corte industrial preciso.",
      },
      {
        label: "Verniz local UV",
        fee: 42,
        type: "perOrder",
        description: "Destaque de logo, nome ou detalhes de marca.",
      },
      {
        label: "Laminação soft touch",
        fee: 68,
        type: "perOrder",
        description: "Toque macio e percepcao mais sofisticada.",
      },
    ],
    deadlines: paperLane,
    applications: ["Networking", "Institucional", "Branding"],
    deliveryNote: "Entrega em caixas compactas separadas por lote.",
    featured: true,
  },
  {
    slug: "lona",
    name: "Lona",
    category: "Grande Formato",
    badge: "Fachadas",
    description:
      "Impressao em lona para fachada, tapume, obra e comunicacao externa com materiais preparados para uso intenso.",
    lead: "Indicada para quem precisa de metragem maior, estrutura robusta e boa durabilidade visual.",
    basePriceM2: 82,
    minimumArea: 1,
    minQuantity: 1,
    materials: [
      {
        label: "Lona frontlight 440g",
        multiplier: 1,
        description: "Versatil para grande formato com boa definicao e custo.",
      },
      {
        label: "Lona blackout 440g",
        multiplier: 1.16,
        description: "Mais estrutura para areas com contraluz e fundo exposto.",
      },
      {
        label: "Lona mesh",
        multiplier: 1.28,
        description: "Permite passagem de ar em fachadas externas maiores.",
      },
    ],
    finishings: [
      {
        label: "Ilhós reforçado",
        fee: 34,
        type: "perOrder",
        description: "Fixacao metalica para instalacao recorrente.",
      },
      {
        label: "Barra soldada",
        fee: 42,
        type: "perOrder",
        description: "Melhor tensao para pecas lineares e fachadas.",
      },
      {
        label: "Bainha dupla",
        fee: 48,
        type: "perOrder",
        description: "Reforco extra para pecas de alto esforco.",
      },
    ],
    deadlines: rigidLane,
    applications: ["Obra", "Tapume", "Fachada"],
    deliveryNote: "Pecas grandes podem seguir fracionadas e identificadas.",
    featured: true,
  },
  {
    slug: "wind-banner",
    name: "Wind banner",
    category: "Sinalização e Exposição",
    badge: "Alta visibilidade",
    description:
      "Display vertical para postos, feiras, eventos e entradas com leitura a distancia e boa area de marca.",
    lead: "Produto ideal para ativacoes, sinalizacao externa e pontos com fluxo constante.",
    basePriceM2: 132,
    minimumArea: 0.9,
    minQuantity: 1,
    materials: [
      {
        label: "Tecido flag",
        multiplier: 1,
        description: "Leve, flexivel e proprio para bandeiras promocionais.",
      },
      {
        label: "Tecido poliéster",
        multiplier: 1.12,
        description: "Boa definicao de cor e durabilidade no uso recorrente.",
      },
      {
        label: "Tecido blackout",
        multiplier: 1.18,
        description: "Mais opacidade e presenca para uso premium.",
      },
    ],
    finishings: [
      {
        label: "Costura padrão",
        fee: 28,
        type: "perOrder",
        description: "Reposicao para quem ja tem estrutura pronta.",
      },
      {
        label: "Estrutura + costura",
        fee: 148,
        type: "perOrder",
        description: "Kit pronto para uso em campo ou evento.",
      },
      {
        label: "Base premium",
        fee: 184,
        type: "perOrder",
        description: "Maior estabilidade para areas abertas e externas.",
      },
    ],
    deadlines: rigidLane,
    applications: ["Eventos", "Postos", "Feiras"],
    deliveryNote: "Estrutura e tecido seguem protegidos em volumes separados.",
    featured: true,
  },
  {
    slug: "placa-pvc",
    name: "Placa PVC",
    category: "Sinalização e Exposição",
    badge: "Sinalizacao",
    description:
      "Placa em PVC para comunicacao interna, PDV e sinalizacao leve com bom custo e boa rigidez.",
    lead: "Indicado para parede, displays, precificacao e projetos promocionais mais enxutos.",
    basePriceM2: 184,
    minimumArea: 0.3,
    minQuantity: 1,
    materials: [
      {
        label: "PVC 2mm",
        multiplier: 1,
        description: "Leve e funcional para uso interno e campanhas sazonais.",
      },
      {
        label: "PVC 3mm",
        multiplier: 1.12,
        description: "Mais corpo para placas de medio porte.",
      },
      {
        label: "PVC 5mm",
        multiplier: 1.26,
        description: "Maior robustez para uso recorrente.",
      },
    ],
    finishings: [
      {
        label: "Corte reto",
        fee: 0,
        type: "perOrder",
        description: "Acabamento padrao com corte industrial.",
      },
      {
        label: "Corte especial",
        fee: 34,
        type: "perUnit",
        description: "Contornos especificos para pecas nao lineares.",
      },
      {
        label: "Dupla face",
        fee: 26,
        type: "perUnit",
        description: "Impressao dos dois lados para uso suspenso ou central.",
      },
    ],
    deadlines: rigidLane,
    applications: ["Parede", "PDV", "Sinalizacao"],
    deliveryNote: "Protecao frontal para reduzir riscos no transporte.",
    featured: true,
  },
  {
    slug: "placa-acm",
    name: "Placa ACM",
    category: "Sinalização e Exposição",
    badge: "Premium",
    description:
      "Placa em ACM para fachadas, sinalizacao corporativa e projetos com maior durabilidade e presenca arquitetonica.",
    lead: "Linha premium para marcas que precisam de acabamento tecnico e imagem mais robusta.",
    basePriceM2: 268,
    minimumArea: 0.35,
    minQuantity: 1,
    materials: [
      {
        label: "ACM 3mm",
        multiplier: 1,
        description: "Padrao profissional para fachada e sinalizacao premium.",
      },
      {
        label: "ACM 4mm",
        multiplier: 1.14,
        description: "Mais robustez estrutural e sensacao de projeto final.",
      },
      {
        label: "ACM escovado",
        multiplier: 1.28,
        description: "Acabamento especial com apelo arquitetonico.",
      },
    ],
    finishings: [
      {
        label: "Corte reto",
        fee: 0,
        type: "perOrder",
        description: "Formato padrao com refinamento de borda.",
      },
      {
        label: "Corte CNC",
        fee: 58,
        type: "perUnit",
        description: "Precisao para letras, contornos e projetos especiais.",
      },
      {
        label: "Espaçadores",
        fee: 82,
        type: "perUnit",
        description: "Fixacao afastada com presenca premium na parede.",
      },
    ],
    deadlines: rigidLane,
    applications: ["Fachada", "Corporativo", "Arquitetura"],
    deliveryNote: "Entrega com protecao de canto e orientacao de fixacao.",
    featured: true,
  },
  {
    slug: "backdrop",
    name: "Backdrop",
    category: "Grande Formato",
    badge: "Eventos",
    description:
      "Backdrop em lona para palco, coletiva, estande e area instagramavel com leitura ampla e acabamento para montagem.",
    lead: "Ideal para quem precisa de fundo visual de marca, patrocinadores ou cenarios de foto com impacto imediato.",
    basePriceM2: 48,
    minimumArea: 4,
    minQuantity: 1,
    materials: [
      {
        label: "Lona brilho 340g",
        multiplier: 1,
        description: "Superficie com brilho comercial para destacar logos e patrocinadores.",
      },
      {
        label: "Lona fosca 340g",
        multiplier: 1.08,
        description: "Mais controle de reflexo em palco, auditório e foto.",
      },
      {
        label: "Lona blackout 440g",
        multiplier: 1.18,
        description: "Mais corpo para estruturas maiores e ambientes externos.",
      },
    ],
    finishings: [
      {
        label: "Ilhós",
        fee: 24,
        type: "perOrder",
        description: "Fixacao rapida em estrutura metalica ou grid.",
      },
      {
        label: "Bolso superior e inferior",
        fee: 52,
        type: "perOrder",
        description: "Encaixe mais limpo para estrutura tubular.",
      },
      {
        label: "Bainha reforçada",
        fee: 38,
        type: "perOrder",
        description: "Mais resistencia para instalacoes recorrentes.",
      },
    ],
    deadlines: rigidLane,
    applications: ["Eventos", "Feiras", "Foto e video"],
    deliveryNote: "Peça enrolada com identificacao de topo e base para montagem.",
    featured: true,
  },
  {
    slug: "banner-tecido",
    name: "Banner em tecido",
    category: "Grande Formato",
    badge: "Leve e premium",
    description:
      "Banner em tecido para eventos, cenografia e displays com visual mais leve e acabamento costurado.",
    lead: "Excelente para quem quer um material elegante, facil de transportar e com boa apresentacao visual.",
    basePriceM2: 42,
    minimumArea: 0.5,
    minQuantity: 1,
    materials: [
      {
        label: "Tecido poliéster 98g",
        multiplier: 1,
        description: "Opcao leve, versatil e indicada para sublimação.",
      },
      {
        label: "Tecido premium",
        multiplier: 1.12,
        description: "Trama mais fechada e melhor apresentacao em ambientes internos.",
      },
      {
        label: "Tecido blackout",
        multiplier: 1.22,
        description: "Mais opacidade para cenarios e fundos com luz traseira.",
      },
    ],
    finishings: [
      {
        label: "Bastão e cordão costurado",
        fee: 8,
        type: "perOrder",
        description: "Acabamento pronto para pendurar em loja, feira ou recepcao.",
      },
      {
        label: "Bainha com túnel",
        fee: 12,
        type: "perOrder",
        description: "Mais limpo para tubo ou estrutura leve.",
      },
      {
        label: "Barra com ilhós",
        fee: 18,
        type: "perOrder",
        description: "Combina costura com fixacao em pontos definidos.",
      },
    ],
    deadlines: fastLane,
    applications: ["Eventos", "Cenografia", "Vitrines"],
    deliveryNote: "Material dobrado com protecao leve para transporte recorrente.",
    featured: true,
  },
  {
    slug: "folheto",
    name: "Folheto",
    category: "Papelaria Promocional",
    badge: "Alta tiragem",
    description:
      "Folheto promocional para distribuicao, campanhas de bairro, panfletagem e reforco de oferta com custo competitivo.",
    lead: "Produto orientado para volume, leitura objetiva e acao comercial de giro rapido.",
    basePriceM2: 6.6,
    minimumArea: 0.014,
    minQuantity: 1000,
    materials: [
      {
        label: "Couchê brilho 90g",
        multiplier: 1,
        description: "Base mais usada para distribuicao de alto volume.",
      },
      {
        label: "Couchê brilho 115g",
        multiplier: 1.12,
        description: "Mais consistencia sem comprometer a escala.",
      },
      {
        label: "Couchê brilho 150g",
        multiplier: 1.26,
        description: "Visual mais encorpado para campanhas premium.",
      },
    ],
    finishings: [
      {
        label: "Refile",
        fee: 0,
        type: "perOrder",
        description: "Acabamento padrao para distribuicao rapida.",
      },
      {
        label: "Refile menor",
        fee: 18,
        type: "perOrder",
        description: "Ajuste fino para formatos promocionais menores.",
      },
      {
        label: "Serrilha",
        fee: 43,
        type: "perOrder",
        description: "Recurso util para cupons, vouchers e destacaveis.",
      },
    ],
    deadlines: paperLane,
    applications: ["Panfletagem", "Promoção", "Campanhas locais"],
    deliveryNote: "Lotes seguem organizados por pacote para distribuicao.",
    featured: true,
  },
  {
    slug: "adesivo-perfurado",
    name: "Adesivo perfurado",
    category: "Adesivos e Aplicação",
    badge: "Vidro e vitrine",
    description:
      "Adesivo perfurado para vidro com impacto externo e preservacao parcial da visibilidade interna.",
    lead: "Muito usado em vitrines, fachadas envidracadas e traseiros automotivos com necessidade de privacidade comercial.",
    basePriceM2: 122,
    minimumArea: 0.45,
    minQuantity: 1,
    materials: [
      {
        label: "Vinil perfurado 120g",
        multiplier: 1,
        description: "Base padrao para vidro com boa relacao entre leitura e visibilidade.",
      },
      {
        label: "Vinil perfurado premium",
        multiplier: 1.14,
        description: "Melhor definicao de imagem e maior estabilidade na aplicacao.",
      },
      {
        label: "Vinil perfurado com laminação",
        multiplier: 1.22,
        description: "Mais protecao superficial para uso externo prolongado.",
      },
    ],
    finishings: [
      {
        label: "Refile automático",
        fee: 0,
        type: "perOrder",
        description: "Corte limpo para instalacao direta em vidro.",
      },
      {
        label: "Corte em painéis",
        fee: 22,
        type: "perOrder",
        description: "Facilita transporte e aplicacao em areas maiores.",
      },
      {
        label: "Kit de aplicação",
        fee: 34,
        type: "perOrder",
        description: "Inclui apoio para instalacao mais segura e precisa.",
      },
    ],
    deadlines: fastLane,
    applications: ["Vitrine", "Fachada envidraçada", "Veículos"],
    deliveryNote: "Envio enrolado com orientacao de sentido para aplicacao.",
    featured: true,
  },
  {
    slug: "totem",
    name: "Totem",
    category: "Sinalização e Exposição",
    badge: "Display de chão",
    description:
      "Totem promocional autoportante para informacao, exposicao e reforco de marca em ponto de venda ou evento.",
    lead: "Bom para entradas, corredores, ativações e areas de fluxo onde a comunicacao precisa ocupar o chao.",
    basePriceM2: 310,
    minimumArea: 0.6,
    minQuantity: 1,
    materials: [
      {
        label: "Polionda branca 4mm",
        multiplier: 1,
        description: "Estrutura leve e funcional para campanhas e eventos.",
      },
      {
        label: "PVC expandido 2mm",
        multiplier: 1.12,
        description: "Melhor planicidade e acabamento para uso interno.",
      },
      {
        label: "PS branco 2mm",
        multiplier: 1.18,
        description: "Visual limpo para comunicacao de curta e media duracao.",
      },
    ],
    finishings: [
      {
        label: "Corte e vinco digital",
        fee: 18,
        type: "perOrder",
        description: "Acabamento base para montagem do totem.",
      },
      {
        label: "Montagem guiada",
        fee: 34,
        type: "perOrder",
        description: "Marcas e dobras pensadas para agilizar a montagem.",
      },
      {
        label: "Base reforçada",
        fee: 52,
        type: "perOrder",
        description: "Melhora estabilidade para uso em areas de fluxo.",
      },
    ],
    deadlines: rigidLane,
    applications: ["Eventos", "Varejo", "Exposição"],
    deliveryNote: "Peças enviadas planas com instrução simples de montagem.",
    featured: true,
  },
  {
    slug: "folder",
    name: "Folder",
    category: "Papelaria Promocional",
    badge: "Apresentação",
    description:
      "Folder dobrado para apresentar servicos, cardapios, tabelas e campanhas com mais espaco de argumento visual.",
    lead: "Ideal para vendas consultivas, apresentação institucional e distribuicao em balcão ou visita comercial.",
    basePriceM2: 28,
    minimumArea: 0.028,
    minQuantity: 500,
    materials: [
      {
        label: "Couchê brilho 90g",
        multiplier: 1,
        description: "Entrada comercial para altas tiragens e campanhas promocionais.",
      },
      {
        label: "Couchê brilho 115g",
        multiplier: 1.1,
        description: "Equilibrio entre custo, corpo e manuseio.",
      },
      {
        label: "Couchê brilho 150g",
        multiplier: 1.22,
        description: "Mais estrutura para apresentação institucional.",
      },
    ],
    finishings: [
      {
        label: "2 dobras sanfona",
        fee: 12,
        type: "perOrder",
        description: "Sequencia em zigue-zague para conteudo mais dinâmico.",
      },
      {
        label: "2 dobras carteira",
        fee: 12,
        type: "perOrder",
        description: "Fechamento mais tradicional para leitura comercial.",
      },
      {
        label: "Vinco reforçado",
        fee: 24,
        type: "perOrder",
        description: "Melhora o fechamento em papeis mais encorpados.",
      },
    ],
    deadlines: paperLane,
    applications: ["Institucional", "Balcão", "Campanhas"],
    deliveryNote: "Lotes embalados por volume para facilitar distribuição.",
    featured: true,
  },
  {
    slug: "faixa-impressa",
    name: "Faixa impressa",
    category: "Grande Formato",
    badge: "Rua e fachada",
    description:
      "Faixa impressa em lona para promocao de rua, fachada, obra, inauguração e comunicação temporária.",
    lead: "Produto pensado para mensagem direta, medida maior e acabamento tradicional de rua.",
    basePriceM2: 76,
    minimumArea: 0.8,
    minQuantity: 1,
    materials: [
      {
        label: "Lona brilho 340g",
        multiplier: 1,
        description: "Opcao comercial para promocao com boa saturacao.",
      },
      {
        label: "Lona fosca 340g",
        multiplier: 1.08,
        description: "Melhora a leitura em ambientes com reflexo.",
      },
      {
        label: "Lona blackout 440g",
        multiplier: 1.16,
        description: "Mais estrutura para usos prolongados e fachadas.",
      },
    ],
    finishings: [
      {
        label: "Bastão e 4 ilhós",
        fee: 32,
        type: "perOrder",
        description: "Composicao classica pronta para instalacao rapida.",
      },
      {
        label: "Ilhós perimetral",
        fee: 38,
        type: "perOrder",
        description: "Mais pontos de fixacao para areas maiores.",
      },
      {
        label: "Bainha reforçada",
        fee: 28,
        type: "perOrder",
        description: "Reforco para amarracao e tensao continua.",
      },
    ],
    deadlines: fastLane,
    applications: ["Fachada", "Promoção", "Eventos locais"],
    deliveryNote: "Entrega enrolada e etiquetada para facilitar a instalacao.",
    featured: true,
  },
];

export const services = [
  {
    title: "Pré-impressão técnica",
    text: "Conferência de arquivo, sangria, perfil de cor e viabilidade antes da produção.",
  },
  {
    title: "Catálogo configurável",
    text: "Grande formato, papelaria, adesivos e sinalização em um fluxo único de compra.",
  },
  {
    title: "Acabamento industrial",
    text: "Ilhós, dobra, corte especial, estrutura e montagem alinhados ao tipo de produto.",
  },
  {
    title: "Entrega orientada",
    text: "Fluxo pensado para retirada, expedição e acompanhamento com status claros.",
  },
];

export const differentiators = [
  {
    title: "Compra com menos atrito",
    text: "O cliente escolhe, configura e segue para o pedido em um fluxo mais próximo de e-commerce.",
  },
  {
    title: "Produtos por categoria real",
    text: "Grande formato, papelaria, adesivos e sinalização organizados de forma mais comercial.",
  },
  {
    title: "Configuração por produto",
    text: "Cada item agora traz opções mais coerentes com uso, material e acabamento da sua categoria.",
  },
  {
    title: "Visual de marca forte",
    text: "Interface limpa, premium e orientada à compra, sem perder a identidade Prismarq.",
  },
];

export const galleryFrames = [
  {
    title: "Campanha de vitrine",
    text: "Adesivos e materiais promocionais com leitura direta e acabamento limpo.",
    accent: "cyan",
  },
  {
    title: "Fachada e exposição",
    text: "Placas, totens e estruturas com maior presença para sinalização comercial.",
    accent: "magenta",
  },
  {
    title: "Eventos e ativação",
    text: "Backdrop, wind banner e banners prontos para palco, estande ou rua.",
    accent: "yellow",
  },
  {
    title: "Papelaria promocional",
    text: "Cartões, folders e folhetos pensados para venda, distribuição e apresentação.",
    accent: "cyan",
  },
];

export const operationalSteps = [
  "Escolha o produto ideal para a aplicação.",
  "Configure material, formato, acabamento e prazo.",
  "Envie a arte ou contrate apoio criativo.",
  "Acompanhe produção, status e entrega pelo sistema.",
];

export const contactChannels = [
  {
    title: "WhatsApp comercial",
    value: "(11) 99876-5432",
    href: "https://wa.me/5511998765432?text=Olá%2C%20quero%20montar%20um%20pedido%20na%20Prismarq.",
  },
  {
    title: "E-mail",
    value: "contato@prismarq.com.br",
    href: "mailto:contato@prismarq.com.br",
  },
  {
    title: "Atendimento",
    value: "Seg a Sex · 08h às 18h",
    href: "#",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}

export const productConfigurations: Record<string, ProductConfiguration> = Object.fromEntries(
  products.map((product) => [product.slug, buildProductConfiguration(product)]),
);

export function getProductConfiguration(slug: string) {
  return productConfigurations[slug] ?? null;
}
