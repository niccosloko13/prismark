import { cn } from "@/lib/utils";

const ITEMS = [
  {
    label: "Atendimento rápido",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Produção sob medida",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 12v8M8 12v4M16 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Entrega no prazo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M3 17h2l3-9h10l2 5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8.5" cy="19" r="1.5" fill="currentColor" />
        <circle cx="18" cy="19" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Qualidade premium",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M12 2l2.2 5.5L20 9l-4.5 3.2L17 18l-5-3-5 3 1.5-5.8L4 9l5.8-1.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

export function ElectionBenefits({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative z-[1] mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 shadow-[0_0_40px_rgba(59,130,246,0.08)] backdrop-blur-md sm:px-6 sm:py-6 lg:mt-14",
        className,
      )}
      aria-label="Benefícios Prismarq"
    >
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-gradient-to-br from-yellow-400/20 to-red-500/10 text-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              {item.icon}
            </span>
            <span className="text-[0.78rem] font-bold uppercase leading-snug tracking-wide text-white/85 sm:text-sm">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
