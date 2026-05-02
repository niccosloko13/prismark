"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

/** Caminho atual codificado para ?returnTo= em links de auth (mesmo site). */
export function useEncodedReturnTo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const current = qs ? `${pathname}?${qs}` : pathname;
  return encodeURIComponent(current);
}

export function HeaderAuthMenu({
  session,
  isStorefront,
  isAdmin,
}: {
  session: SessionUser | null;
  isStorefront: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const encodedReturn = useEncodedReturnTo();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const linkLogin = `/login?returnTo=${encodedReturn}`;
  const linkCadastro = `/cadastro?returnTo=${encodedReturn}`;

  const triggerClass = cn(
    "focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
    isStorefront
      ? "border-white/30 bg-white/[0.06] text-white hover:border-white/45 hover:bg-white/[0.1]"
      : "border-black/12 bg-white text-ink hover:border-black/18 hover:bg-black/[0.02]",
  );

  const menuClass = cn(
    "absolute right-0 top-[calc(100%+0.45rem)] z-50 min-w-[12.5rem] overflow-hidden rounded-2xl border py-2 shadow-[0_20px_48px_rgba(0,0,0,0.35)]",
    isStorefront
      ? "border-white/12 bg-[#0d1019]/96 text-white backdrop-blur-xl"
      : "border-black/10 bg-white text-ink shadow-[0_16px_40px_rgba(15,15,15,0.12)]",
  );

  const itemClass = cn(
    "block px-4 py-2.5 text-sm font-semibold transition",
    isStorefront ? "text-white/90 hover:bg-white/[0.08]" : "text-ink hover:bg-black/[0.04]",
  );

  if (isAdmin) {
    return null;
  }

  if (session) {
    const label = session.name?.split(" ")[0] ?? "Conta";
    return (
      <div className="relative min-w-0" ref={wrapRef}>
        <button
          type="button"
          className={triggerClass}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/90 to-purple-500/90 text-xs font-bold text-white">
            {(session.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[6.5rem] truncate sm:max-w-[7.5rem]">{label}</span>
          <svg viewBox="0 0 20 20" className={cn("h-4 w-4 shrink-0 opacity-70 transition", open && "rotate-180")} aria-hidden>
            <path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {open ? (
          <div className={menuClass} role="menu">
            <Link href="/dashboard" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
              Meu painel
            </Link>
            <Link href="/dashboard#pedidos" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
              Meus pedidos
            </Link>
            <div className={cn("border-t pt-1", isStorefront ? "border-white/10" : "border-black/8")}>
              <LogoutButton
                className={cn(
                  "focus-ring w-full justify-start rounded-none border-0 !bg-transparent px-4 py-2.5 text-left text-sm font-semibold shadow-none hover:!bg-black/[0.06]",
                  isStorefront && "hover:!bg-white/[0.08] !text-white",
                )}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative min-w-0" ref={wrapRef}>
      <button
        type="button"
        className={triggerClass}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Login
        <svg viewBox="0 0 20 20" className={cn("h-4 w-4 shrink-0 opacity-70 transition", open && "rotate-180")} aria-hidden>
          <path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div className={menuClass} role="menu">
          <Link href={linkLogin} className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
            Entrar
          </Link>
          <Link href={linkCadastro} className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
            Criar conta
          </Link>
        </div>
      ) : null}
    </div>
  );
}
