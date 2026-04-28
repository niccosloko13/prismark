import Image, { type ImageProps } from "next/image";

import { getPublicImageSrcCandidates } from "@/lib/product-images";

export type ProductRasterPictureProps = {
  src: string;
  /** Se omitido, deriva de `src` (webp + arquivo raster catalogado). */
  srcCandidates?: string[];
} & Omit<ImageProps, "src">;

/**
 * Preferência WebP via &lt;picture&gt; quando há candidato .webp, com fallback JPEG/PNG.
 */
export function ProductRasterPicture({
  src,
  srcCandidates,
  fill,
  className,
  alt,
  ...rest
}: ProductRasterPictureProps) {
  const candidates = srcCandidates ?? getPublicImageSrcCandidates(src);
  const webp = candidates.find((c) => c.toLowerCase().endsWith(".webp"));
  const fallback = candidates.find((c) => !c.toLowerCase().endsWith(".webp")) ?? src;

  if (!webp || webp === fallback) {
    return <Image src={fallback} alt={alt} fill={fill} className={className} {...rest} />;
  }

  return (
    <picture className={fill ? "absolute inset-0" : "block"}>
      <source srcSet={webp} type="image/webp" />
      <Image src={fallback} alt={alt} fill={fill} className={className} {...rest} />
    </picture>
  );
}
