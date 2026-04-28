"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/layout/brand-logo";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/payments", label: "Pagamentos Pix" },
  { href: "/admin/pix-settings", label: "Configuracao Pix" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/products", label: "Produtos" },
];

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

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="panel hidden h-fit p-4 lg:sticky lg:top-4 lg:block">
        <div className="rounded-[18px] border border-black/10 bg-white p-3">
          <BrandLogo size="sm" />
        </div>
        <nav className="mt-4 grid gap-2">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[14px] px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-ink text-white" : "bg-white text-ink hover:bg-black/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="btn btn-secondary focus-ring mt-4 w-full justify-center"
        >
          {loggingOut ? "Saindo..." : "Sair"}
        </button>
      </aside>

      <main className="space-y-4 pb-24 lg:pb-0">
        <header className="panel p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label-kicker">Admin Prismarq</p>
              <h1 className="display-title mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-2 text-sm text-black/62">{subtitle}</p> : null}
            </div>
            <button type="button" className="btn btn-secondary lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
              Menu
            </button>
          </div>

          {mobileOpen ? (
            <div className="mt-4 grid gap-2 lg:hidden">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-[14px] px-3 py-2.5 text-sm font-semibold transition ${
                      active ? "bg-ink text-white" : "bg-white text-ink hover:bg-black/[0.04]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button type="button" onClick={logout} disabled={loggingOut} className="btn btn-secondary w-full justify-center">
                {loggingOut ? "Saindo..." : "Sair"}
              </button>
            </div>
          ) : null}
        </header>

        {children}

        <nav className="panel fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-2 p-2 lg:hidden">
          {items.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[12px] px-2 py-2 text-center text-[0.7rem] font-semibold ${
                pathname === item.href ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
