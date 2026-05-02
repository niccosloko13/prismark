"use client";

import Image from "next/image";
import Link from "next/link";

const STEPS = [
  { id: "cart", label: "Carrinho" },
  { id: "review", label: "Revisão" },
  { id: "pay", label: "Pagamento" },
  { id: "done", label: "Conclusão" },
] as const;

export function CheckoutHeader({ activeStepIndex = 1 }: { activeStepIndex?: number }) {
  return (
    <header className="mb-5 overflow-hidden rounded-[20px] border border-white/10 bg-[#0b0e15]/95 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mb-6">
      <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Link href="/" className="relative block h-9 w-[128px] shrink-0 sm:h-10 sm:w-[148px]">
            <Image
              src="/checkout.png"
              alt="Prismarq"
              fill
              className="object-contain object-left"
              sizes="148px"
              priority
            />
          </Link>
          <div className="min-w-0 border-l border-white/10 pl-3 sm:pl-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M12 3 4 7v6c0 5 4 8 8 8s8-3 8-8V7l-8-4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="truncate">Checkout seguro</span>
            </p>
            <p className="mt-0.5 truncate text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/45 sm:text-xs sm:normal-case sm:tracking-normal sm:text-white/55">
              Produção, pagamento e entrega no mesmo fluxo.
            </p>
          </div>
        </div>

        <nav
          className="flex min-w-0 items-center justify-between gap-1 overflow-x-auto pb-0.5 sm:justify-end sm:gap-2 sm:pb-0"
          aria-label="Etapas do checkout"
        >
          {STEPS.map((step, index) => {
            const active = index === activeStepIndex;
            const done = index < activeStepIndex;
            return (
              <div key={step.id} className="flex min-w-0 items-center gap-1 sm:gap-2">
                {index > 0 ? <span className="hidden h-px w-3 shrink-0 bg-white/15 sm:block sm:w-4" aria-hidden /> : null}
                <div
                  className={[
                    "flex min-w-0 items-center gap-2 rounded-full px-2 py-1.5 sm:px-3",
                    active
                      ? "bg-gradient-to-r from-fuchsia-500/25 to-violet-500/20 ring-1 ring-fuchsia-400/35"
                      : done
                        ? "bg-white/[0.06]"
                        : "opacity-60",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold tabular-nums",
                      active
                        ? "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-md"
                        : done
                          ? "bg-emerald-500/25 text-emerald-200"
                          : "bg-white/10 text-white/55",
                    ].join(" ")}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <span
                    className={[
                      "hidden max-w-[5.5rem] truncate text-[0.7rem] font-semibold sm:inline sm:max-w-none sm:text-xs",
                      active ? "text-white" : "text-white/55",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
