import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderPixPagamentoClient } from "@/components/dashboard/order-pix-pagamento-client";
import { getSession } from "@/lib/auth";
import { paymentsService } from "@/server/services/payments.service";

export default async function OrderPixPagamentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ outros?: string; pix?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    const { orderId } = await params;
    redirect(`/login?returnTo=${encodeURIComponent(`/dashboard/pedidos/${orderId}/pagamento`)}`);
  }

  const { orderId } = await params;
  const { outros: outrosRaw, pix: pixStatus } = await searchParams;
  const outrosPedidos = Math.max(0, Math.min(50, Number(outrosRaw) || 0));

  const { order, payment } = await paymentsService.getPixManualPageData(orderId, session);

  if (!payment) {
    return (
      <div className="panel p-8 text-center text-white/70">
        <p className="text-lg font-semibold text-white">
          {pixStatus === "unavailable"
            ? "Pedido criado, mas o Pix não pôde ser gerado agora."
            : "Não há pagamento Pix registrado para este pedido."}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/65">
          O pedido ficou salvo no painel. Tente novamente em instantes ou fale com a Prismarq para receber a chave Pix.
        </p>
        <Link href="/dashboard" className="btn btn-secondary focus-ring mt-6 inline-flex">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  return <OrderPixPagamentoClient order={order} payment={payment} outrosPedidosPix={outrosPedidos} />;
}
