import type { Role } from "@/types";

const BLOCKED_PATH_PREFIXES = ["/api", "/_next", "/admin/login"];

/**
 * Evita open redirect e envio de cliente para área admin.
 * Aceita apenas caminhos relativos ao mesmo site.
 */
export function sanitizeReturnTo(raw: string | null | undefined, role: Role): string | null {
  if (raw == null || typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }
  if (trimmed.length > 2048) {
    return null;
  }
  if (/[\r\n\x00<>]/.test(trimmed)) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes("javascript:") || lower.includes("data:") || lower.includes("vbscript:")) {
    return null;
  }

  let pathWithSearch: string;
  try {
    const dummy = "https://prismarq.local";
    const u = new URL(trimmed, dummy);
    if (u.origin !== dummy) {
      return null;
    }
    pathWithSearch = u.pathname + u.search;
  } catch {
    return null;
  }

  const pathOnly = pathWithSearch.split("?")[0] ?? "";

  for (const prefix of BLOCKED_PATH_PREFIXES) {
    if (pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)) {
      return null;
    }
  }

  if (role !== "admin") {
    if (pathOnly === "/admin" || pathOnly.startsWith("/admin/")) {
      return null;
    }
  }

  return pathWithSearch;
}

/** Destino após login/cadastro OAuth ou formulário. */
export function defaultPostAuthPath(role: Role, returnTo: string | null | undefined): string {
  const safe = sanitizeReturnTo(returnTo ?? null, role);
  if (role === "admin") {
    return safe ?? "/admin";
  }
  return safe ?? "/";
}
