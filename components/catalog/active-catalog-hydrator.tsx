"use client";

import { useEffect, useRef } from "react";

import { hydrateActiveProductSnapshotsFromList, type ActiveProduct } from "@/lib/active-product-snapshot";
import { setDynamicCatalogFromActiveProducts } from "@/lib/catalog";
import type { ProductExperience } from "@/lib/product-experience";
import { setStoreProductExperiences } from "@/lib/product-experience";
import type { Product } from "@/types";

export function ActiveCatalogHydrator() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void fetch("/api/store/active-catalog-bridge")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            products?: Product[];
            storeExperiences?: Array<{ slug: string; experience: ProductExperience }>;
            activeProducts?: ActiveProduct[];
          } | null,
        ) => {
          if (!data?.products?.length) return;
          setDynamicCatalogFromActiveProducts(data.products);
          setStoreProductExperiences(data.storeExperiences ?? []);
          if (data.activeProducts?.length) {
            hydrateActiveProductSnapshotsFromList(data.activeProducts);
          }
        },
      )
      .catch(() => {
        /* rede indisponível: fluxo continua com catálogo estático + snapshot do carrinho */
      });
  }, []);

  return null;
}
