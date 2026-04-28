import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/common/badge";
import { BrandLogo } from "@/components/layout/brand-logo";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.role === "admin") {
    redirect("/admin");
  }

  if (session?.role === "client") {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-6 sm:p-8 lg:p-10">
        <div className="inline-flex max-w-full rounded-[22px] border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-3 sm:rounded-[26px] sm:px-5 sm:py-4">
          <BrandLogo size="xl" priority className="focus-ring" />
        </div>
        <Badge tone="magenta" className="mt-6">
          Portal de pedidos
        </Badge>
        <h1 className="display-title mt-5 text-[clamp(2.5rem,4vw,4.25rem)] font-semibold leading-[0.95] tracking-tight text-balance">
          Login e cadastro para acompanhar pedidos e abrir novos jobs.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/68">
          A plataforma já opera com autenticação segura, perfis de cliente e admin e estrutura pronta para
          escalar a operação com banco PostgreSQL e storage configurável.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="surface-soft p-5">
            <p className="label-kicker">Admin demo</p>
            <p className="mt-3 text-sm font-medium text-ink">admin@prismarq.com.br</p>
            <p className="mt-1 text-sm text-black/62">Senha: admin123</p>
          </div>
          <div className="surface-soft p-5">
            <p className="label-kicker">Cliente demo</p>
            <p className="mt-3 text-sm font-medium text-ink">felipe@novaobra.com.br</p>
            <p className="mt-1 text-sm text-black/62">Senha: cliente123</p>
          </div>
        </div>
      </section>

      <AuthForm />
    </div>
  );
}
