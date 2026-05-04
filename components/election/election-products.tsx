import Image from "next/image";
import Link from "next/link";

import { ELECTION_MATERIALS } from "@/lib/election-materials";
import { cn } from "@/lib/utils";

export function ElectionProducts({ className }: { className?: string }) {
  return (
    <section id="materiais" className={cn("relative z-[1] min-w-0", className)} aria-labelledby="election-products-heading">
      <div className="text-center lg:text-left">
        <h2
          id="election-products-heading"
          className="text-[clamp(1.35rem,3.5vw,1.85rem)] font-black uppercase leading-tight tracking-wide text-white"
        >
          Escolha seu material
        </h2>
        <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/70 sm:text-base">
          Clique para configurar e pedir — mesmo fluxo dos outros produtos.
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        {ELECTION_MATERIALS.map((item) => (
          <li key={`${item.name}-${item.sizeNote}`} className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className={cn(
                "group flex min-h-[4.75rem] w-full items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2.5 backdrop-blur-md transition duration-200 sm:gap-3 sm:px-3.5 sm:py-3",
                "hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-white/[0.07] hover:shadow-[0_4px_24px_rgba(250,204,21,0.18)]",
              )}
            >
              <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] sm:h-11 sm:w-11">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="44px"
                  className="object-cover opacity-85 transition duration-200 group-hover:opacity-100 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[0.78rem] font-black uppercase leading-tight tracking-wide text-white sm:text-[0.88rem]">
                  {item.name}
                </p>
                <p className="mt-0.5 truncate text-[0.63rem] font-medium text-white/55 sm:text-[0.68rem]">
                  {item.sizeNote}
                </p>
              </div>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-3.5 w-3.5 shrink-0 text-white/25 transition group-hover:text-yellow-400/65"
                aria-hidden
              >
                <path d="m6 3 4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
