import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionShell({
  title,
  eyebrow,
  description,
  className,
  variant = "default",
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  className?: string;
  /** `dark`: glass escuro (home premium), sem `.panel` claro. */
  variant?: "default" | "dark";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        variant === "dark"
          ? "rounded-[22px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_64px_rgba(0,0,0,0.35)] sm:rounded-[28px] sm:p-8 lg:p-10 xl:rounded-[34px] xl:p-11"
          : "panel p-3.5 sm:p-8 lg:p-10 xl:p-11",
        className,
      )}
    >
      <div className="mb-4 max-w-4xl sm:mb-9">
        <p className={cn("label-kicker", variant === "dark" && "!text-cyan-300/80")}>{eyebrow}</p>
        <h2
          className={cn(
            "display-title mt-2 max-w-3xl text-balance text-[clamp(1.45rem,5vw,3.35rem)] font-semibold leading-[1.05] tracking-tight text-white sm:mt-3 sm:leading-[1]",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-white/70 sm:mt-4 sm:text-base sm:leading-7",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
