"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SITE_DARK = "prismarq-site-dark";
const ADMIN_LIGHT = "prismarq-admin";

/**
 * Storefront: fundo #05070d em toda a viewport.
 * `/admin/*` mantém tema claro para painel operacional.
 */
export function BodyRouteClass() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = pathname.startsWith("/admin");
    document.documentElement.classList.toggle(SITE_DARK, !isAdmin);
    document.body.classList.toggle(SITE_DARK, !isAdmin);
    document.documentElement.classList.toggle(ADMIN_LIGHT, isAdmin);
    document.body.classList.toggle(ADMIN_LIGHT, isAdmin);
  }, [pathname]);

  return null;
}
