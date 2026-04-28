import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionShell({
  title,
  eyebrow,
  description,
  className,
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("panel p-4 sm:p-8 lg:p-10 xl:p-11", className)}>
      <div className="mb-6 max-w-4xl sm:mb-9">
        <p className="label-kicker">{eyebrow}</p>
        <h2 className="display-title mt-2 max-w-3xl text-balance text-[clamp(1.45rem,5vw,3.35rem)] font-semibold leading-[1.05] tracking-tight sm:mt-3 sm:leading-[1]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-black/62 sm:mt-4 sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
