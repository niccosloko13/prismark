"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/payments", label: "Pix pendentes" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/products", label: "Produtos" },
] as const;

const secondaryNav = [
  { href: "/admin/settings", label: "Configurações" },
  { href: "/admin/marketing", label: "Marketing" },
] as const;

function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "rounded-[14px] px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-gradient-to-r from-cyan-500/25 to-fuchsia-500/20 text-white shadow-[0_0_24px_rgba(56,189,248,0.12)]"
          : "text-white/65 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-dark min-h-screen text-white">
      <div className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-6 lg:py-6">
        <aside className="hidden h-fit lg:block">
          <div className="sticky top-4 space-y-4 rounded-[24px] border border-white/10 bg-[#0a0e18]/95 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.04] p-3">
              <BrandLogo size="sm" />
            </div>
            <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">Operação</p>
            <nav className="grid gap-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </nav>
            <p className="px-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              Sistema
            </p>
            <nav className="grid gap-1">
              {secondaryNav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </nav>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="focus-ring mt-2 w-full rounded-[14px] border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              {loggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 space-y-4 pb-24 lg:pb-6">
          <header className="rounded-[24px] border border-white/10 bg-[#0a0e18]/92 p-4 shadow-[0_20px_56px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                  Admin Prismarq
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-2xl text-sm text-white/58">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                className="focus-ring rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                Menu
              </button>
            </div>

            {mobileOpen ? (
              <div className="mt-4 grid gap-1 border-t border-white/10 pt-4 lg:hidden">
                {[...mainNav, ...secondaryNav].map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={pathname === item.href}
                    onNavigate={closeMobile}
                  />
                ))}
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className="mt-2 rounded-[14px] border border-white/15 py-2.5 text-sm font-semibold text-white/80"
                >
                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            ) : null}
          </header>

          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#05070d]/96 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[1600px] justify-around gap-1">
          {["/admin", "/admin/orders", "/admin/payments", "/admin/settings"].map((href) => {
            const label =
              href === "/admin"
                ? "Início"
                : href === "/admin/orders"
                  ? "Pedidos"
                  : href === "/admin/payments"
                    ? "Pix"
                    : "Config";
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "min-w-0 flex-1 rounded-xl px-1 py-2 text-center text-[0.65rem] font-semibold sm:text-[0.7rem]",
                  active ? "bg-white/12 text-white" : "text-white/55",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
