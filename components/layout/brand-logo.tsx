import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo header (2).png";
const LOGO_WIDTH = 1536;
const LOGO_HEIGHT = 1024;

const sizeMap = {
  sm: {
    imageClassName: "h-11 w-auto sm:h-12",
    sizes: "(max-width: 640px) 140px, 160px",
  },
  md: {
    imageClassName: "h-12 w-auto sm:h-14",
    sizes: "(max-width: 640px) 160px, 200px",
  },
  lg: {
    imageClassName: "h-14 w-auto sm:h-16 lg:h-[4.25rem]",
    sizes: "(max-width: 640px) 200px, (max-width: 1024px) 240px, 280px",
  },
  header: {
    imageClassName: "h-14 w-auto sm:h-16 lg:h-[4.5rem]",
    sizes: "(max-width: 640px) 220px, (max-width: 1024px) 260px, 300px",
  },
  xl: {
    imageClassName: "h-[4.5rem] w-auto sm:h-28 lg:h-32",
    sizes: "(max-width: 640px) 300px, (max-width: 1024px) 360px, 420px",
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
      <Image
        src={LOGO_SRC}
        alt="Prismarq Comunicação Visual"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        sizes={variant.sizes}
        className={cn(
          "max-w-full select-none object-contain object-left",
          variant.imageClassName,
          onDark && "mix-blend-lighten contrast-[1.06] [isolation:isolate]",
        )}
      />
    </Link>
  );
}
