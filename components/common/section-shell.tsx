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
    <section className={cn("panel p-5 sm:p-8 lg:p-10 xl:p-11", className)}>
      <div className="mb-7 max-w-4xl sm:mb-9">
        <p className="label-kicker">{eyebrow}</p>
        <h2 className="display-title mt-3 max-w-3xl text-[clamp(1.7rem,4.8vw,3.35rem)] font-semibold leading-[1] tracking-tight text-balance">
          {title}
        </h2>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-black/62 sm:text-base sm:leading-7">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
