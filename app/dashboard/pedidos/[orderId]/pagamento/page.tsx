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
  searchParams: Promise<{ outros?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    const { orderId } = await params;
    redirect(`/login?returnTo=${encodeURIComponent(`/dashboard/pedidos/${orderId}/pagamento`)}`);
  }

  const { orderId } = await params;
  const { outros: outrosRaw } = await searchParams;
  const outrosPedidos = Math.max(0, Math.min(50, Number(outrosRaw) || 0));

  const { order, payment } = await paymentsService.getPixManualPageData(orderId, session);

  if (!payment) {
    return (
      <div className="panel p-8 text-center text-white/70">
        <p>Não há pagamento Pix registrado para este pedido.</p>
        <Link href="/dashboard" className="btn btn-secondary focus-ring mt-6 inline-flex">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  return (
    <OrderPixPagamentoClient order={order} payment={payment} outrosPedidosPix={outrosPedidos} />
  );
}
