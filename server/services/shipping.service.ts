import { AppError } from "@/server/errors/app-error";
import { buildShippingQuote, normalizeCep, type ShippingDestination } from "@/lib/shipping";
import { shippingQuoteSchema } from "@/server/validation/shipping";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

async function fetchCepAddress(cep: string): Promise<ShippingDestination> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new AppError("Não foi possível consultar o CEP informado.", 502, "cep_lookup_failed");
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro || !data.localidade || !data.uf) {
    throw new AppError("CEP não encontrado para cotação logística.", 404, "cep_not_found");
  }

  return {
    cep: data.cep ?? cep,
    city: data.localidade,
    state: data.uf,
    neighborhood: data.bairro,
    street: data.logradouro,
  };
}

export const shippingService = {
  async quote(rawInput: {
    cep?: string;
    width?: number | string;
    height?: number | string;
    quantity?: number | string;
  }) {
    const input = shippingQuoteSchema.parse(rawInput);
    const cep = normalizeCep(input.cep);

    if (cep.length !== 8) {
      throw new AppError("Informe um CEP válido para calcular o frete.", 400, "invalid_cep");
    }

    const destination = await fetchCepAddress(cep);

    return buildShippingQuote(destination, {
      width: input.width,
      height: input.height,
      quantity: input.quantity,
    });
  },
};
