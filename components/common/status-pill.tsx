import type { OrderStatus } from "@/types";

import { cn } from "@/lib/utils";

const statusMap: Record<OrderStatus, string> = {
  novo: "bg-black/[0.04] text-ink border-black/10",
  "aguardando pagamento": "bg-amber-100 text-amber-900 border-amber-300",
  confirmado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelado: "bg-rose-100 text-rose-800 border-rose-200",
  "aguardando arte": "bg-yellow/25 text-ink border-yellow/45",
  "em análise": "bg-magenta/10 text-ink border-magenta/35",
  produção: "bg-cyan/10 text-ink border-cyan/35",
  finalizado: "bg-ink text-white border-black/12",
  entregue: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
        statusMap[status],
      )}
    >
      {status}
    </span>
  );
}
