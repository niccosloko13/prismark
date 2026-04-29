import type { OrderStatus } from "@/types";

import { cn } from "@/lib/utils";

const statusMapLight: Record<OrderStatus, string> = {
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

const statusMapDark: Record<OrderStatus, string> = {
  novo: "bg-white/10 text-white border-white/18",
  "aguardando pagamento": "bg-amber-500/20 text-amber-100 border-amber-400/35",
  confirmado: "bg-emerald-500/18 text-emerald-100 border-emerald-400/30",
  cancelado: "bg-rose-500/18 text-rose-100 border-rose-400/35",
  "aguardando arte": "bg-yellow-400/15 text-yellow-100 border-yellow-300/35",
  "em análise": "bg-magenta/25 text-pink-100 border-magenta/40",
  produção: "bg-cyan/20 text-cyan-100 border-cyan-400/35",
  finalizado: "bg-white/15 text-white border-white/25",
  entregue: "bg-emerald-500/18 text-emerald-100 border-emerald-400/30",
};

export function StatusPill({
  status,
  tone = "light",
  label,
}: {
  status: OrderStatus;
  tone?: "light" | "dark";
  /** Texto exibido no lugar do slug interno (ex.: painel do cliente). */
  label?: string;
}) {
  const map = tone === "dark" ? statusMapDark : statusMapLight;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
        map[status],
      )}
    >
      {label ?? status}
    </span>
  );
}
