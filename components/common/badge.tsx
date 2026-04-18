import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "border-black/10 bg-white text-black/70",
  cyan: "border-cyan/24 bg-cyan/[0.08] text-ink",
  magenta: "border-magenta/24 bg-magenta/[0.08] text-ink",
  yellow: "border-yellow/40 bg-yellow/[0.18] text-ink",
};

type BadgeTone = keyof typeof toneClasses;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.66)]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
