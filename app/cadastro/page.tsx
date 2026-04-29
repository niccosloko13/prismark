import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/common/badge";
import { BrandLogo } from "@/components/layout/brand-logo";
import { getSession } from "@/lib/auth";
import { defaultPostAuthPath } from "@/lib/safe-return-to";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getSession();
  const { returnTo } = await searchParams;
  const loginHref = returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/login";

  if (session?.role === "client") {
    redirect(defaultPostAuthPath("client", returnTo));
  }

  if (session?.role === "admin") {
    redirect(defaultPostAuthPath("admin", returnTo));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-6 sm:p-8 lg:p-10">
        <div className="inline-flex max-w-full rounded-[22px] border border-white/12 bg-white/[0.06] px-4 py-3 sm:rounded-[26px] sm:px-5 sm:py-4">
          <BrandLogo size="xl" priority className="focus-ring" />
        </div>
        <Badge tone="cyan" className="mt-6">
          Cadastro rápido
        </Badge>
        <h1 className="display-title mt-5 text-[clamp(2.5rem,4vw,4.25rem)] font-semibold leading-[0.95] tracking-tight text-balance text-white">
          Crie sua conta em poucos segundos e acompanhe seus pedidos.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
          Nome, e-mail e senha. WhatsApp é opcional — usamos só para avisos do pedido, se você quiser.
        </p>
      </section>

      <div>
        <AuthForm defaultMode="register" showModeToggle={false} quickRegister />
        <p className="mt-4 text-center text-sm text-white/60">
          Já tenho conta?{" "}
          <Link href={loginHref} className="font-semibold text-cyan-300 underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
