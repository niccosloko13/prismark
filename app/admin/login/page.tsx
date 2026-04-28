import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="panel p-6 sm:p-8">
        <p className="label-kicker">Painel Administrativo</p>
        <h2 className="display-title mt-2 text-3xl font-semibold tracking-tight text-ink">Prismarq Operação</h2>
        <p className="mt-2 text-sm text-black/62">Acesso restrito para gestão de pedidos, pagamentos Pix e catálogo.</p>
      </section>
      <AdminLoginForm />
    </div>
  );
}
