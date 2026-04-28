"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/admin";
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      const username = String(formData.get("username") ?? "");
      const password = String(formData.get("password") ?? "");

      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const payload = (await response.json()) as { message?: string; user?: { role: string } };
        if (!response.ok || payload.user?.role !== "admin") {
          throw new Error(payload.message ?? "Credenciais inválidas.");
        }
        router.push(returnTo);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha ao autenticar.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="panel mx-auto w-full max-w-md space-y-4 p-6 sm:p-8">
      <div>
        <p className="label-kicker">Admin</p>
        <h1 className="display-title mt-2 text-2xl font-semibold tracking-tight text-ink">Entrar no painel</h1>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-black/62">Usuário</span>
        <input name="username" className="field" required placeholder="niccos" autoComplete="username" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium text-black/62">Senha</span>
        <input
          name="password"
          type="password"
          className="field"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <button type="submit" className="btn btn-primary w-full justify-center" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
