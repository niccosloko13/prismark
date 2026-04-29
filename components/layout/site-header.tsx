"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CartNavLink } from "@/components/cart/cart-nav-link";
import { HeaderAuthMenu, useEncodedReturnTo } from "@/components/layout/header-auth-menu";
import { HeaderSearch } from "@/components/layout/header-search";
import { LogoutButton } from "@/components/layout/logout-button";
import { companyLinks, companyProfile } from "@/lib/company";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const HEADER_LOGO_SRC = "/logo header (2).png";

function TinyDot() {
  return <span className="h-1 w-1 rounded-full bg-white/35" aria-hidden />;
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  homeUnderline = false,
  plain = false,
  active = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Sublinhado em gradiente no hover (home premium). */
  homeUnderline?: boolean;
  /** Estilo totalmente controlado por `className` (ex.: Pedido online). */
  plain?: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring relative rounded-full px-4 py-2.5 text-[0.92rem] font-semibold transition",
        plain
          ? null
          : homeUnderline
            ? "home-nav-link text-white/90 hover:bg-white/[0.06] hover:text-white"
            : "btn-ghost text-black/70",
        active &&
          "text-white after:content-[''] after:absolute after:left-4 after:right-4 after:bottom-[5px] after:h-px after:rounded-full after:bg-gradient-to-r after:from-pink-400 after:via-purple-400 after:to-cyan-400",
        className,
      )}
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
  storefront,
}: {
  href: string;
  children: ReactNode;
  highlighted?: boolean;
  onNavigate?: () => void;
  storefront: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "focus-ring flex min-h-[52px] items-center justify-between rounded-[20px] border px-4 py-3 text-sm font-semibold transition",
        highlighted
          ? storefront
            ? "border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-[0_8px_32px_rgba(168,85,247,0.4),0_0_40px_rgba(56,189,248,0.15)]"
            : "border-ink bg-ink text-white shadow-[0_16px_34px_rgba(15,15,15,0.18)]"
          : storefront
            ? "border-white/12 bg-white/[0.05] text-white hover:border-white/20 hover:bg-white/[0.08]"
            : "border-black/10 bg-white text-ink hover:border-black/18 hover:bg-black/[0.03]",
      )}
    >
      <span>{children}</span>
      <span className={cn("text-sm", highlighted ? "text-white/72" : storefront ? "text-white/40" : "text-black/34")}>{">"}</span>
    </Link>
  );
}

function HeaderBrand({
  mobile = false,
  priority = false,
  onClick,
  homePremium = false,
}: {
  mobile?: boolean;
  priority?: boolean;
  onClick?: () => void;
  homePremium?: boolean;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Ir para a home da Prismarq"
      className={cn(
        "focus-ring inline-flex max-w-full shrink-0 items-center rounded-none border-none bg-transparent shadow-none transition hover:opacity-90",
        mobile ? "max-w-[min(220px,calc(100vw-6.75rem))]" : "max-w-[280px]",
      )}
    >
      <Image
        src={HEADER_LOGO_SRC}
        alt="Prismarq Comunicação Visual"
        width={1536}
        height={1024}
        priority={priority}
        sizes={mobile ? "(max-width: 640px) 220px, 240px" : "(max-width: 1280px) 260px, 280px"}
        className={cn(
          "h-auto border-none bg-transparent object-contain object-left shadow-none",
          homePremium ? "mix-blend-lighten contrast-[1.06] [isolation:isolate]" : "",
          mobile
            ? "max-h-8 w-auto max-w-[min(200px,calc(100vw-7rem))] sm:max-h-9 sm:max-w-[220px]"
            : "w-[230px] sm:w-[250px] lg:w-[260px] xl:w-[280px]",
        )}
      />
    </Link>
  );
}

function HomePedidoOnlineLink() {
  return (
    <Link
      href="/order"
      className="focus-ring rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 p-[1px] shadow-[0_0_24px_rgba(168,85,247,0.25)] transition hover:brightness-110"
    >
      <span className="flex min-h-[44px] items-center justify-center rounded-full bg-[#05070d]/95 px-4 py-2.5 text-[0.92rem] font-semibold text-white">
        Pedido online
      </span>
    </Link>
  );
}

export function SiteHeader({ session }: { session: SessionUser | null }) {
  const pathname = usePathname();
  const encodedReturnTo = useEncodedReturnTo();
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

  const isStorefront = !pathname.startsWith("/admin");

  const isAdmin = session?.role === "admin";
  const accountHref = "/dashboard";
  const mobileLoginHref = `/login?returnTo=${encodedReturnTo}`;
  const mobileCadastroHref = `/cadastro?returnTo=${encodedReturnTo}`;
  const isHomeActive = pathname === "/";
  const isProdutosActive = pathname === "/produtos" || pathname === "/products";
  const isContatoActive = pathname === "/contact";

  return (
    <>
      <header className={cn("relative z-40 w-full max-w-full", !isStorefront && "border-b border-[#E5E7EB]")}>
        <div
          className={cn(
            "relative w-full max-w-full overflow-hidden rounded-[20px] px-3 py-2 sm:rounded-[28px] sm:px-6 sm:py-3.5 lg:px-7",
            isStorefront
              ? "border border-white/8 bg-[#05070d]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_56px_rgba(168,85,247,0.08)] backdrop-blur-xl"
              : "header-home-shell border border-[#E5E7EB] bg-[#ECEBED]",
          )}
        >
          <div className="relative lg:hidden">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 items-center">
                <HeaderBrand mobile priority homePremium={isStorefront} />
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 self-center">
                <CartNavLink compact headerOnDark={isStorefront} className="shrink-0" />
                <button
                  type="button"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-drawer"
                  aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  className={cn(
                    "focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition sm:h-11 sm:w-11",
                    isStorefront
                      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                      : "border-[#E5E7EB] bg-[#F3F4F6] text-ink hover:bg-white",
                  )}
                >
                  {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:grid lg:grid-cols-[auto,minmax(0,1fr)] lg:items-center lg:gap-6 xl:gap-8">
            <HeaderBrand priority homePremium={isStorefront} />

            <div className="flex min-w-0 flex-col gap-3">
              <div className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2", !isStorefront && "rounded-2xl border border-black/8 bg-white/80 px-3 py-2.5")}>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2.5 text-[0.72rem] font-semibold",
                    isStorefront ? "text-white/80" : "text-black/52",
                  )}
                >
                  <a href={companyLinks.phone} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition", isStorefront ? "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white" : "border-black/8 bg-white/88 hover:border-black/14 hover:text-ink")}>
                    <span aria-hidden>✆</span>
                    {companyProfile.phoneDisplay}
                  </a>
                  <TinyDot />
                  <a href={companyLinks.email} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition", isStorefront ? "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white" : "border-black/8 bg-white/88 hover:border-black/14 hover:text-ink")}>
                    <span aria-hidden>✉</span>
                    {companyProfile.email}
                  </a>
                  <TinyDot />
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5", isStorefront ? "border-white/8 bg-white/[0.03] text-white/70" : "border-black/8 bg-white/88")}>
                    <span aria-hidden>⌖</span>
                    {companyProfile.cityState}
                  </span>
                </div>
                <p className={cn("max-w-xl text-[0.72rem] font-medium leading-snug", isStorefront ? "text-white/70" : "text-black/46")}>
                  Impressão profissional com pedido online.
                </p>
              </div>

              <div
                className={cn(
                  "flex min-w-0 flex-wrap items-center justify-between gap-3 border-t pt-3",
                  isStorefront ? "border-white/[0.08]" : "border-[#E5E7EB]",
                )}
              >
                <nav className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <HeaderNavLink href="/" homeUnderline={isStorefront} active={isHomeActive}>
                    {isStorefront ? "Início" : "Home"}
                  </HeaderNavLink>
                  {isStorefront ? (
                    <div className="group relative">
                      <Link
                        href="/produtos"
                        className={cn(
                          "focus-ring home-nav-link inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-[0.92rem] font-semibold text-white/90 transition hover:bg-white/[0.06] hover:text-white",
                          isProdutosActive &&
                            "text-white after:content-[''] after:absolute after:left-4 after:right-4 after:bottom-[5px] after:h-px after:bg-gradient-to-r after:from-pink-400 after:via-purple-400 after:to-cyan-400",
                        )}
                      >
                        Produtos
                        <ChevronDown />
                      </Link>
                      <div className="invisible absolute left-0 top-[calc(100%+0.4rem)] z-30 min-w-[13rem] translate-y-1 rounded-2xl border border-white/8 bg-white/[0.04] p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <Link href="/produtos" className="focus-ring block rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white">
                          Ver todos os produtos
                        </Link>
                        <Link href="/produtos?categoria=banners" className="focus-ring block rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white">
                          Banners
                        </Link>
                        <Link href="/produtos?categoria=papelaria" className="focus-ring block rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white">
                          Papelaria
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <HeaderNavLink href="/produtos" homeUnderline={isStorefront} active={isProdutosActive}>
                      Produtos
                    </HeaderNavLink>
                  )}
                  {isStorefront ? (
                    <HomePedidoOnlineLink />
                  ) : (
                    <HeaderNavLink
                      href="/order"
                      plain
                      className="border border-cyan/20 bg-cyan/[0.14] text-ink shadow-[0_10px_24px_rgba(0,181,255,0.12)] hover:border-cyan/26 hover:bg-cyan/[0.18]"
                    >
                      Pedido online
                    </HeaderNavLink>
                  )}
                  <HeaderNavLink href="/contact" homeUnderline={isStorefront} active={isContatoActive}>
                    Contato
                  </HeaderNavLink>
                </nav>

                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  <HeaderSearch className="w-[18rem] xl:w-[20rem]" tone={isStorefront ? "dark" : "light"} />
                  <div className={cn("hidden h-8 w-px xl:block", isStorefront ? "bg-white/12" : "bg-black/8")} />
                  <CartNavLink headerOnDark={isStorefront} />
                  {isAdmin ? (
                    <LogoutButton
                      className={
                        isStorefront
                          ? "!border-white/20 !bg-transparent !text-white hover:!bg-white/10"
                          : undefined
                      }
                    />
                  ) : (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <HeaderAuthMenu session={session} isStorefront={isStorefront} isAdmin={false} />
                      {!session ? (
                        <Link
                          href="/order"
                          className={cn(
                            "focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition",
                            isStorefront
                              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white shadow-[0_8px_30px_rgba(168,85,247,0.38),0_0_32px_rgba(56,189,248,0.2)] hover:scale-[1.03] hover:brightness-110"
                              : "btn btn-primary",
                          )}
                        >
                          Pedir agora
                        </Link>
                      ) : null}
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
            "absolute inset-y-0 right-0 flex w-full max-w-[22rem] flex-col border-l px-4 pb-6 pt-4 shadow-[0_26px_72px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out sm:px-5 sm:pt-5",
            isStorefront
              ? "border-white/8 bg-[#05070d]/96 backdrop-blur-xl"
              : "border-transparent bg-white shadow-[0_26px_72px_rgba(15,15,15,0.18)]",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-3 border-b pb-4",
              isStorefront ? "border-white/8" : "border-black/8",
            )}
          >
            <HeaderBrand mobile onClick={() => setIsMobileMenuOpen(false)} />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border transition",
                isStorefront
                  ? "border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
                  : "border-black/10 bg-white text-ink hover:bg-black/[0.03]",
              )}
            >
              <CloseIcon />
            </button>
          </div>

          <HeaderSearch
            mobile
            className="mt-5"
            tone={isStorefront ? "dark" : "light"}
            onNavigate={() => setIsMobileMenuOpen(false)}
          />

          <div className="mt-5 flex flex-col gap-3">
            <DrawerLink href="/" storefront={isStorefront}>
              Início
            </DrawerLink>
            <DrawerLink href="/produtos" storefront={isStorefront}>
              Produtos
            </DrawerLink>
            <DrawerLink href="/order" storefront={isStorefront}>
              Pedido online
            </DrawerLink>
            <DrawerLink href="/contact" storefront={isStorefront}>
              Contato
            </DrawerLink>
            {session && !isAdmin ? (
              <>
                <DrawerLink href={accountHref} highlighted storefront={isStorefront}>
                  Meu painel
                </DrawerLink>
                <DrawerLink href={`${accountHref}#pedidos`} storefront={isStorefront}>
                  Meus pedidos
                </DrawerLink>
              </>
            ) : !session ? (
              <>
                <DrawerLink href={mobileLoginHref} highlighted storefront={isStorefront}>
                  Entrar
                </DrawerLink>
                <DrawerLink href={mobileCadastroHref} storefront={isStorefront}>
                  Criar conta
                </DrawerLink>
              </>
            ) : null}
            {!session ? (
              <Link
                href="/order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="home-btn-gradient focus-ring mt-1 w-full justify-center"
              >
                Começar pedido agora
              </Link>
            ) : null}
          </div>

          <div
            className={cn(
              "mt-5 rounded-[24px] border p-4",
              isStorefront ? "border-white/8 bg-white/[0.04] backdrop-blur-xl" : "border-black/10 bg-black/[0.02]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={cn("text-[0.68rem] font-semibold uppercase tracking-[0.22em]", isStorefront ? "text-white/50" : "text-black/46")}>
                  Carrinho
                </p>
                <p className={cn("mt-2 text-sm leading-6", isStorefront ? "text-white/65" : "text-black/62")}>
                  Acesse seus itens configurados antes de fechar.
                </p>
              </div>
              <CartNavLink compact headerOnDark={isStorefront} />
            </div>
          </div>

          <div
            className={cn(
              "mt-4 rounded-[24px] border p-4",
              isStorefront
                ? "border-white/8 bg-white/[0.04] shadow-[0_12px_28px_rgba(0,0,0,0.3)] backdrop-blur-xl"
                : "border-black/10 bg-white shadow-[0_12px_28px_rgba(15,15,15,0.04)]",
            )}
          >
            <p className={cn("text-[0.68rem] font-semibold uppercase tracking-[0.22em]", isStorefront ? "text-white/50" : "text-black/46")}>
              Contato direto
            </p>
            <a href={companyLinks.phone} className={cn("mt-3 block text-base font-semibold", isStorefront ? "text-white" : "text-ink")}>
              {companyProfile.phoneDisplay}
            </a>
            <a href={companyLinks.email} className={cn("mt-2 block break-all text-sm", isStorefront ? "text-white/65" : "text-black/62")}>
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
