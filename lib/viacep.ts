export type ViaCepSuccess = {
  erro?: boolean;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export async function fetchViaCep(cepDigits: string): Promise<ViaCepSuccess | null> {
  const clean = cepDigits.replace(/\D/g, "");
  if (clean.length !== 8) {
    return null;
  }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as ViaCepSuccess & { erro?: boolean };
    if (data.erro) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
