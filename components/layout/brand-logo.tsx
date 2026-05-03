import Link from "next/link";

import { cn } from "@/lib/utils";

import { HEADER_LOGO_HEIGHT, HEADER_LOGO_SRC, HEADER_LOGO_WIDTH } from "@/lib/brand-assets";

const sizeMap = {
  sm: {
    imageClassName: "h-11 w-auto sm:h-12",
  },
  md: {
    imageClassName: "h-12 w-auto sm:h-14",
  },
  lg: {
    imageClassName: "h-14 w-auto sm:h-16 lg:h-[4.25rem]",
  },
  header: {
    imageClassName: "h-14 w-auto sm:h-16 lg:h-[4.5rem]",
  },
  xl: {
    imageClassName: "h-[4.5rem] w-auto sm:h-28 lg:h-32",
  },
} as const;

export type BrandLogoSize = keyof typeof sizeMap;

export function BrandLogo({
  className,
  priority = false,
  size = "md",
  onDark = false,
}: {
  className?: string;
  priority?: boolean;
  size?: BrandLogoSize;
  /** Fundo escuro: reduz caixa branca em PNG sem canal alpha. */
  onDark?: boolean;
}) {
  const variant = sizeMap[size];

  return (
    <Link
      href="/"
      aria-label="Ir para a página inicial da Prismarq Comunicação Visual"
      className={cn("inline-flex shrink-0 items-center transition hover:opacity-90", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HEADER_LOGO_SRC}
        alt="Prismarq Comunicação Visual"
        width={HEADER_LOGO_WIDTH}
        height={HEADER_LOGO_HEIGHT}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        className={cn(
          "max-w-full select-none object-contain object-left",
          variant.imageClassName,
          onDark && "mix-blend-lighten contrast-[1.06] [isolation:isolate]",
        )}
      />
    </Link>
  );
}
