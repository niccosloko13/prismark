import { roundTo } from "@/lib/utils";

export interface ShippingDestination {
  cep: string;
  city: string;
  state: string;
  neighborhood?: string;
  street?: string;
}

export interface ShippingQuoteMethod {
  id: string;
  label: string;
  price: number;
  etaLabel: string;
  description: string;
  recommended?: boolean;
}

export interface ShippingQuoteResult {
  destination: ShippingDestination;
  regionLabel: string;
  volumeLabel: string;
  methods: ShippingQuoteMethod[];
  note: string;
}

export interface ShippingQuoteInput {
  cep: string;
  width?: number;
  height?: number;
  quantity?: number;
}

const REGION_BY_STATE: Record<string, string> = {
  AC: "Norte",
  AL: "Nordeste",
  AP: "Norte",
  AM: "Norte",
  BA: "Nordeste",
  CE: "Nordeste",
  DF: "Centro-Oeste",
  ES: "Sudeste",
  GO: "Centro-Oeste",
  MA: "Nordeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  MG: "Sudeste",
  PA: "Norte",
  PB: "Nordeste",
  PR: "Sul",
  PE: "Nordeste",
  PI: "Nordeste",
  RJ: "Sudeste",
  RN: "Nordeste",
  RS: "Sul",
  RO: "Norte",
  RR: "Norte",
  SC: "Sul",
  SP: "Sudeste",
  SE: "Nordeste",
  TO: "Norte",
};

const METRO_CITIES = new Set(
  [
    "sao-bernardo-do-campo",
    "sao-paulo",
    "santo-andre",
    "sao-caetano-do-sul",
    "diadema",
    "maua",
    "ribeirao-pires",
    "rio-grande-da-serra",
    "osasco",
    "guarulhos",
    "barueri",
    "taboao-da-serra",
  ].map(normalizeCityKey),
);

function normalizeCityKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string) {
  const digits = normalizeCep(value);
  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidCep(value: string) {
  return normalizeCep(value).length === 8;
}

function describeVolume(width: number, height: number, quantity: number) {
  const area = Math.max((width / 100) * (height / 100), 0.12);
  const logisticFactor = area * Math.max(quantity, 1);

  if (logisticFactor <= 1.8) {
    return "pedido leve";
  }

  if (logisticFactor <= 6) {
    return "pedido médio";
  }

  if (logisticFactor <= 15) {
    return "pedido volumoso";
  }

  return "pedido especial";
}

export function buildShippingQuote(
  destination: ShippingDestination,
  rawInput: Omit<ShippingQuoteInput, "cep">,
): ShippingQuoteResult {
  const width = Math.max(Number(rawInput.width ?? 100), 1);
  const height = Math.max(Number(rawInput.height ?? 100), 1);
  const quantity = Math.max(Number(rawInput.quantity ?? 1), 1);
  const area = Math.max((width / 100) * (height / 100), 0.12);
  const loadFactor = roundTo(Math.max(1, Math.sqrt(area) + Math.log10(quantity + 9)), 2);

  const cityKey = normalizeCityKey(destination.city);
  const state = destination.state.toUpperCase();
  const regionLabel = REGION_BY_STATE[state] ?? "Brasil";
  const sameCity = cityKey === normalizeCityKey("São Bernardo do Campo");
  const metroArea = state === "SP" && METRO_CITIES.has(cityKey);
  const sameState = state === "SP";

  const methods: ShippingQuoteMethod[] = [
    {
      id: "pickup",
      label: "Retirada comercial",
      price: 0,
      etaLabel: sameCity ? "disponível no dia" : "agendamento em 1 dia útil",
      description: "Retirada com agendamento na unidade comercial da Prismarq.",
      recommended: sameCity,
    },
  ];

  if (sameCity) {
    methods.push(
      {
        id: "motoboy-local",
        label: "Entrega local",
        price: roundTo(22 + loadFactor * 6),
        etaLabel: "até 1 dia útil",
        description: "Entrega expressa para a cidade de destino com operação local.",
        recommended: true,
      },
      {
        id: "rota-abc",
        label: "Rota regional",
        price: roundTo(32 + loadFactor * 5.2),
        etaLabel: "1 a 2 dias úteis",
        description: "Opção econômica para rota comercial com conferência manual.",
      },
    );
  } else if (metroArea) {
    methods.push(
      {
        id: "rota-metropolitana",
        label: "Rota metropolitana",
        price: roundTo(34 + loadFactor * 6.4),
        etaLabel: "1 a 2 dias úteis",
        description: "Entrega regional para Grande São Paulo e ABC com janela comercial.",
        recommended: true,
      },
      {
        id: "transportadora-abc",
        label: "Transportadora regional",
        price: roundTo(46 + loadFactor * 5.5),
        etaLabel: "2 a 3 dias úteis",
        description: "Consolidação com coleta e entrega em horário comercial.",
      },
    );
  } else if (sameState) {
    methods.push(
      {
        id: "transportadora-sp",
        label: "Transportadora SP",
        price: roundTo(58 + loadFactor * 7.8),
        etaLabel: "2 a 4 dias úteis",
        description: "Envio para interior e litoral com tratamento para peças gráficas.",
        recommended: true,
      },
      {
        id: "expresso-sp",
        label: "Expresso estadual",
        price: roundTo(84 + loadFactor * 9.2),
        etaLabel: "1 a 2 dias úteis",
        description: "Operação mais rápida para pedidos urgentes no estado.",
      },
    );
  } else if (regionLabel === "Sudeste" || regionLabel === "Sul") {
    methods.push(
      {
        id: "transportadora-interestadual",
        label: "Transportadora interestadual",
        price: roundTo(86 + loadFactor * 10.6),
        etaLabel: "3 a 6 dias úteis",
        description: "Entrega com rastreio e tratamento comercial para pedidos gráficos.",
        recommended: true,
      },
      {
        id: "economico-interestadual",
        label: "Econômico programado",
        price: roundTo(72 + loadFactor * 8.8),
        etaLabel: "4 a 7 dias úteis",
        description: "Melhor custo para pedidos de campanha com prazo mais confortável.",
      },
    );
  } else {
    methods.push(
      {
        id: "transportadora-nacional",
        label: "Transportadora nacional",
        price: roundTo(114 + loadFactor * 12.5),
        etaLabel: "5 a 9 dias úteis",
        description: "Cotação nacional com conferência de volume e prioridade logística.",
        recommended: true,
      },
      {
        id: "economico-nacional",
        label: "Rota econômica",
        price: roundTo(96 + loadFactor * 10.4),
        etaLabel: "6 a 10 dias úteis",
        description: "Melhor custo para pedidos maiores enviados fora do eixo Sudeste/Sul.",
      },
    );
  }

  return {
    destination: {
      ...destination,
      cep: formatCep(destination.cep),
    },
    regionLabel,
    volumeLabel: describeVolume(width, height, quantity),
    methods,
    note:
      "Estimativa logística calculada a partir do CEP consultado e do volume atual do pedido. O valor final pode ser ajustado após conferência comercial.",
  };
}
