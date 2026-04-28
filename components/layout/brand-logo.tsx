import Image from "next/image";
import Link from "next/link";

import logoImage from "@/public/logo.png";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    imageClassName: "h-8 sm:h-9",
    sizes: "96px",
  },
  md: {
    imageClassName: "h-10 sm:h-11",
    sizes: "(max-width: 640px) 120px, 144px",
  },
  lg: {
    imageClassName: "h-12 sm:h-14",
    sizes: "(max-width: 640px) 160px, 192px",
  },
  header: {
    imageClassName: "h-11 sm:h-12 lg:h-[3.35rem]",
    sizes: "(max-width: 640px) 160px, (max-width: 1024px) 192px, 232px",
  },
  xl: {
    imageClassName: "h-[3.35rem] sm:h-20 lg:h-24",
    sizes: "(max-width: 640px) 240px, (max-width: 1024px) 260px, 300px",
  },
} as const;

export type BrandLogoSize = keyof typeof sizeMap;

export function BrandLogo({
  className,
  priority = false,
  size = "md",
}: {
  className?: string;
  priority?: boolean;
  size?: BrandLogoSize;
}) {
  const variant = sizeMap[size];

  return (
    <Link
      href="/"
      aria-label="Ir para a página inicial da Prismarq Comunicação Visual"
      className={cn("inline-flex shrink-0 items-center transition hover:opacity-90", className)}
    >
      <Image
        src={logoImage}
        alt="Prismarq Comunicação Visual"
        width={logoImage.width}
        height={logoImage.height}
        priority={priority}
        sizes={variant.sizes}
        className={cn("w-auto select-none object-contain", variant.imageClassName)}
      />
    </Link>
  );
}
