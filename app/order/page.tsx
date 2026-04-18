import { Badge } from "@/components/common/badge";
import { OrderBuilder } from "@/components/order/order-builder";
import { getSession } from "@/lib/auth";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    width?: string;
    height?: string;
    quantity?: string;
    material?: string;
    finishing?: string;
    deadline?: string;
    notes?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    cep?: string;
    address?: string;
    deliveryMode?: "delivery" | "pickup";
    paymentMethod?: "pix" | "card";
  }>;
}) {
  const session = await getSession();
  const resolvedSearchParams = await searchParams;
  const parsePositiveNumber = (value?: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };

  const initialConfig = {
    width: parsePositiveNumber(resolvedSearchParams.width),
    height: parsePositiveNumber(resolvedSearchParams.height),
    quantity: parsePositiveNumber(resolvedSearchParams.quantity),
    material: resolvedSearchParams.material,
    finishing: resolvedSearchParams.finishing,
    deadline: resolvedSearchParams.deadline,
    notes: resolvedSearchParams.notes,
  };

  const initialCheckout = {
    customerName: resolvedSearchParams.customerName,
    customerEmail: resolvedSearchParams.customerEmail,
    customerPhone: resolvedSearchParams.customerPhone,
    cep: resolvedSearchParams.cep,
    address: resolvedSearchParams.address,
    deliveryMode: resolvedSearchParams.deliveryMode,
    paymentMethod: resolvedSearchParams.paymentMethod,
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="cyan">Checkout seguro</Badge>
          <Badge tone="neutral">Produ&ccedil;&atilde;o, pagamento e entrega no mesmo fluxo</Badge>
        </div>
        <h1 className="display-title mt-4 max-w-4xl text-[clamp(2.5rem,4vw,4.15rem)] font-semibold leading-[0.94] tracking-tight text-balance">
          Finalize seu pedido com produ&ccedil;&atilde;o profissional e entrega garantida
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/66">
          Revise os dados, confira o frete, escolha o pagamento e conclua sem sair do fluxo.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/52">
          Seu arquivo, carrinho e dados de contato continuam preservados durante a revis&atilde;o.
        </p>
      </section>

      <OrderBuilder
        session={session}
        initialProductSlug={resolvedSearchParams.product}
        initialConfig={initialConfig}
        initialCheckout={initialCheckout}
      />
    </div>
  );
}
