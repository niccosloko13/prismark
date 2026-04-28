"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CartNavLink } from "@/components/cart/cart-nav-link";
import { HeaderSearch } from "@/components/layout/header-search";
import { LogoutButton } from "@/components/layout/logout-button";
import { companyLinks, companyProfile } from "@/lib/company";
import { cn } from "@/lib/utils";
import headerLogoImage from "@/public/logo header.png";
import type { SessionUser } from "@/types";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="m6 6 12 12" strokeLinecap="round" />
      <path d="M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function HeaderNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("btn-ghost focus-ring rounded-full px-4 py-2.5 text-[0.92rem] font-semibold text-black/70", className)}
    >
      {children}
    </Link>
  );
}

function DrawerLink({
  href,
  children,
  highlighted = false,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  highlighted?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "focus-ring flex min-h-[52px] items-center justify-between rounded-[20px] border px-4 py-3 text-sm font-semibold transition",
        highlighted
          ? "border-ink bg-ink text-white shadow-[0_16px_34px_rgba(15,15,15,0.18)]"
          : "border-black/10 bg-white text-ink hover:border-black/18 hover:bg-black/[0.03]",
      )}
    >
      <span>{children}</span>
      <span className={cn("text-sm", highlighted ? "text-white/72" : "text-black/34")}>{">"}</span>
    </Link>
  );
}

function HeaderBrand({
  mobile = false,
  priority = false,
  onClick,
}: {
  mobile?: boolean;
  priority?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Ir para a home da Prismarq"
      className={cn(
        "focus-ring flex max-w-full items-center rounded-[20px] border border-[#E5E7EB] bg-[#F3F4F6] transition hover:border-black/12",
        mobile ? "w-full max-w-[min(220px,calc(100vw-7.25rem))] px-2 py-2 sm:max-w-[228px]" : "px-2.5 py-1.5 xl:px-3.5 xl:py-2",
      )}
    >
      <Image
        src={headerLogoImage}
        alt="Prismarq Comunicacao Visual"
        priority={priority}
        sizes={mobile ? "(max-width: 640px) 220px, 228px" : "(max-width: 1280px) 236px, 268px"}
        className={cn(
          "h-auto w-full object-contain object-left",
          mobile ? "w-full" : "w-[228px] xl:w-[248px] 2xl:w-[264px]",
        )}
      />
    </Link>
  );
}

export function SiteHeader({ session }: { session: SessionUser | null }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;

    if (isMobileMenuOpen) {
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const accountHref = session?.role === "admin" ? "/admin" : "/dashboard";
  const accountLabel = session?.role === "admin" ? "Painel admin" : session ? "Minha conta" : "Login / Cadastro";

  return (
    <>
      <header className="relative z-40 border-b border-[#E5E7EB]">
        <div className="relative overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#ECEBED] px-3 py-2.5 sm:rounded-[28px] sm:px-6 sm:py-3.5 lg:px-7">

          <div className="relative lg:hidden">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <HeaderBrand mobile priority />
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <CartNavLink compact className="shrink-0" />
                <button
                  type="button"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-drawer"
                  aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F3F4F6] text-ink transition hover:bg-white"
                >
                  {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:grid lg:grid-cols-[auto,minmax(0,1fr)] lg:items-center lg:gap-6 xl:gap-8">
            <HeaderBrand priority />

            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold text-black/52">
                  <span className="rounded-full border border-cyan/14 bg-cyan/[0.07] px-3 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-ink">
                    Producao propria
                  </span>
                  <a
                    href={companyLinks.phone}
                    className="rounded-full border border-black/8 bg-white/88 px-3 py-1.5 transition hover:border-black/14 hover:text-ink"
                  >
                    {companyProfile.phoneDisplay}
                  </a>
                  <a
                    href={companyLinks.email}
                    className="rounded-full border border-black/8 bg-white/88 px-3 py-1.5 transition hover:border-black/14 hover:text-ink"
                  >
                    {companyProfile.email}
                  </a>
                  <span className="rounded-full border border-black/8 bg-white/88 px-3 py-1.5">{companyProfile.cityState}</span>
                </div>
                <p className="text-[0.72rem] font-medium text-black/46">Impressao profissional com pedido online mais direto.</p>
              </div>

              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#E5E7EB] bg-[#ECEBED] p-1.5">
                <nav className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <HeaderNavLink href="/">Home</HeaderNavLink>
                  <HeaderNavLink href="/products">Produtos</HeaderNavLink>
                  <HeaderNavLink
                    href="/order"
                    className="border border-cyan/20 bg-cyan/[0.14] text-ink shadow-[0_10px_24px_rgba(0,181,255,0.12)] hover:border-cyan/26 hover:bg-cyan/[0.18]"
                  >
                    Pedido online
                  </HeaderNavLink>
                  <HeaderNavLink href="/contact">Contato</HeaderNavLink>
                </nav>

                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  <HeaderSearch className="w-[18rem] xl:w-[20rem]" />
                  <div className="hidden h-8 w-px bg-black/8 xl:block" />
                  <CartNavLink />
                  {session ? (
                    <>
                      <Link href={accountHref} className="btn btn-primary focus-ring px-4 py-2.5">
                        {accountLabel}
                      </Link>
                      <LogoutButton />
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/login" className="btn btn-secondary focus-ring px-4 py-2.5">
                        Login
                      </Link>
                      <Link href="/order" className="btn btn-primary focus-ring px-4 py-2.5">
                        Pedir agora
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/38 backdrop-blur-[2px] transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside
          id="mobile-drawer"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-[22rem] flex-col bg-white px-4 pb-6 pt-4 shadow-[0_26px_72px_rgba(15,15,15,0.18)] transition-transform duration-300 ease-out sm:px-5 sm:pt-5",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/8 pb-4">
            <HeaderBrand mobile onClick={() => setIsMobileMenuOpen(false)} />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:bg-black/[0.03]"
            >
              <CloseIcon />
            </button>
          </div>

          <HeaderSearch mobile className="mt-5" onNavigate={() => setIsMobileMenuOpen(false)} />

          <div className="mt-5 flex flex-col gap-3">
            <DrawerLink href="/">
              Home
            </DrawerLink>
            <DrawerLink href="/products">
              Produtos
            </DrawerLink>
            <DrawerLink href="/order">
              Pedido online
            </DrawerLink>
            <DrawerLink href="/contact">
              Contato
            </DrawerLink>
            <DrawerLink href={session ? accountHref : "/login"} highlighted>
              {accountLabel}
            </DrawerLink>
            {!session ? (
              <Link
                href="/order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-primary focus-ring mt-1 w-full justify-center"
              >
                Comecar pedido agora
              </Link>
            ) : null}
          </div>

          <div className="mt-5 rounded-[24px] border border-black/10 bg-black/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/46">Carrinho</p>
                <p className="mt-2 text-sm leading-6 text-black/62">Acesse seus itens configurados antes de fechar.</p>
              </div>
              <CartNavLink compact />
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_12px_28px_rgba(15,15,15,0.04)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-black/46">Contato direto</p>
            <a href={companyLinks.phone} className="mt-3 block text-base font-semibold text-ink">
              {companyProfile.phoneDisplay}
            </a>
            <a href={companyLinks.email} className="mt-2 block break-all text-sm text-black/62">
              {companyProfile.email}
            </a>
          </div>

          {session ? (
            <div className="mt-auto pt-5">
              <LogoutButton className="w-full justify-center py-3" />
            </div>
          ) : (
            <div className="mt-auto pt-5">
              <Link
                href={companyLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-secondary focus-ring w-full justify-center py-3"
              >
                Falar no WhatsApp
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
