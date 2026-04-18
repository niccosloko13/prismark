"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type AuthMode = "login" | "register";

const GOOGLE_AUTH_ERRORS: Record<string, string> = {
  access_denied: "O acesso com Google foi cancelado antes da conclusÃ£o.",
  google_access_denied: "O acesso com Google foi cancelado antes da conclusÃ£o.",
  google_auth_failed: "NÃ£o foi possÃ­vel concluir o login com Google.",
  google_auth_unavailable: "O login com Google nÃ£o estÃ¡ disponÃ­vel nesta instalaÃ§Ã£o.",
  google_code_missing: "O Google nÃ£o retornou um cÃ³digo vÃ¡lido para autenticaÃ§Ã£o.",
  google_discovery_failed: "NÃ£o foi possÃ­vel iniciar o login com Google agora.",
  google_link_failed: "A conta Google foi validada, mas nÃ£o foi possÃ­vel vinculÃ¡-la.",
  google_oauth_not_configured: "O login com Google ainda nÃ£o foi configurado no ambiente.",
  google_profile_refresh_failed: "A conta Google foi validada, mas nÃ£o foi possÃ­vel concluir a sessÃ£o.",
  google_state_missing: "A sessÃ£o de login com Google expirou. Tente novamente.",
  google_state_mismatch: "A sessÃ£o de login com Google expirou. Tente novamente.",
  invalid_google_oauth_state: "A sessÃ£o de login com Google expirou. Tente novamente.",
  google_nonce_mismatch: "A resposta do Google nÃ£o corresponde a esta sessÃ£o.",
  google_token_exchange_failed: "NÃ£o foi possÃ­vel concluir a autenticaÃ§Ã£o com Google.",
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21.81 12.23c0-.72-.06-1.25-.2-1.8H12.2v3.4h5.53c-.11.84-.72 2.1-2.08 2.95l-.02.11 3.03 2.3.21.02c1.93-1.74 2.94-4.32 2.94-7.38Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 22c2.7 0 4.97-.87 6.63-2.36l-3.22-2.43c-.86.59-2.01 1.01-3.41 1.01-2.64 0-4.88-1.7-5.68-4.06l-.11.01-3.15 2.39-.04.1C4.86 19.87 8.23 22 12.2 22Z"
        fill="#34A853"
      />
      <path
        d="M6.52 14.16c-.21-.61-.33-1.26-.33-1.93 0-.67.12-1.32.32-1.93l-.01-.13-3.18-2.42-.1.05A9.7 9.7 0 0 0 2.1 12.23c0 1.57.39 3.04 1.12 4.34l3.3-2.41Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 6.23c1.77 0 2.96.75 3.64 1.38l2.66-2.53C17.16 3.87 14.9 3 12.2 3 8.23 3 4.86 5.13 3.22 8.32l3.29 2.5c.81-2.36 3.05-4.59 5.69-4.59Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const authErrorCode = searchParams.get("authError");
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const authErrorMessage = authErrorCode ? GOOGLE_AUTH_ERRORS[authErrorCode] ?? "NÃ£o foi possÃ­vel concluir a autenticaÃ§Ã£o." : "";
  const feedbackError = error || authErrorMessage;
  const googleLoginHref = `/api/auth/google${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  async function handleSubmit(formData: FormData) {
    setError("");
    setMessage("");

    startTransition(async () => {
      const payload =
        mode === "login"
          ? {
              email: String(formData.get("email") ?? ""),
              password: String(formData.get("password") ?? ""),
            }
          : {
              name: String(formData.get("name") ?? ""),
              email: String(formData.get("email") ?? ""),
              company: String(formData.get("company") ?? ""),
              phone: String(formData.get("phone") ?? ""),
              password: String(formData.get("password") ?? ""),
            };

      try {
        const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as {
          message?: string;
          user?: { role: "admin" | "client" };
        };

        if (!response.ok || !data.user) {
          throw new Error(data.message ?? "Não foi possível autenticar.");
        }

        setMessage(mode === "login" ? "Login realizado com sucesso." : "Conta criada com sucesso.");
        router.push(data.user.role === "admin" ? "/admin" : returnTo || "/dashboard");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="panel p-6 sm:p-8">
      <div className="grid grid-cols-2 gap-3 rounded-full border border-black/10 bg-black/[0.03] p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          data-active={mode === "login"}
          className="btn-chip focus-ring"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          data-active={mode === "register"}
          className="btn-chip focus-ring"
        >
          Cadastro
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <a
          href={googleLoginHref}
          className="focus-ring inline-flex w-full items-center justify-center gap-3 rounded-full border border-black/12 bg-white px-5 py-3.5 text-sm font-semibold text-ink shadow-[0_16px_34px_rgba(15,15,15,0.06)] transition hover:-translate-y-0.5 hover:border-black/16 hover:shadow-[0_22px_44px_rgba(15,15,15,0.1)]"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.08)]">
            <GoogleMark />
          </span>
          <span>Entrar com Google</span>
        </a>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-black/10" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-black/42">
            ou continue com e-mail
          </span>
          <span className="h-px flex-1 bg-black/10" />
        </div>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Nome</span>
              <input name="name" required className="field" placeholder="Seu nome" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Empresa</span>
              <input name="company" required className="field" placeholder="Nome da empresa" />
            </label>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">E-mail</span>
            <input name="email" type="email" required className="field" placeholder="voce@empresa.com.br" />
          </label>
          {mode === "register" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Telefone</span>
              <input name="phone" required className="field" placeholder="(11) 99999-9999" />
            </label>
          ) : null}
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Senha</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
            placeholder="Mínimo de 8 caracteres"
          />
        </label>

        <div aria-live="polite" className="min-h-6 text-sm">
          {feedbackError ? <p className="font-medium text-red-600">{feedbackError}</p> : null}
          {!feedbackError && message ? <p className="font-medium text-emerald-700">{message}</p> : null}
        </div>

        <button type="submit" disabled={isPending} className="btn btn-primary focus-ring w-full">
          {isPending ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
