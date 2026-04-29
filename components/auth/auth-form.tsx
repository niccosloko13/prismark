"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";

import { defaultPostAuthPath } from "@/lib/safe-return-to";

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

export function AuthForm({
  defaultMode = "login",
  showModeToggle = true,
  quickRegister = false,
  bottomLink,
}: {
  defaultMode?: AuthMode;
  showModeToggle?: boolean;
  /** Cadastro em uma etapa: sem campo empresa (usa Particular no servidor). */
  quickRegister?: boolean;
  /** Ex.: link para /login na página de cadastro */
  bottomLink?: ReactNode;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const authErrorCode = searchParams.get("authError");
  const [mode, setMode] = useState<AuthMode>(defaultMode);
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
              ...(quickRegister
                ? {}
                : { company: String(formData.get("company") ?? "").trim() || undefined }),
              phone: String(formData.get("phone") ?? "").trim() || undefined,
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
        const nextPath = defaultPostAuthPath(data.user.role, returnTo);
        router.push(nextPath);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
      }
    });
  }

  return (
    <div className="panel p-6 sm:p-8">
      {showModeToggle ? (
        <div className="grid grid-cols-2 gap-3 rounded-full border border-white/12 bg-white/[0.05] p-1">
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
      ) : null}

      <div className="mt-6 space-y-4">
        <a
          href={googleLoginHref}
          className="focus-ring inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-[0_22px_44px_rgba(0,0,0,0.35)]"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.1] shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
            <GoogleMark />
          </span>
          <span>Entrar com Google</span>
        </a>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-white/12" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/45">
            ou continue com e-mail
          </span>
          <span className="h-px flex-1 bg-white/12" />
        </div>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-white">Nome completo</span>
              <input name="name" required autoComplete="name" className="field" placeholder="Seu nome" />
            </label>
            {!quickRegister ? (
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-white">Empresa ou projeto (opcional)</span>
                <input name="company" className="field" placeholder="Deixe em branco para Particular" />
              </label>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field"
              placeholder="voce@empresa.com.br"
            />
          </label>
          {mode === "register" ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">WhatsApp (opcional)</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                className="field"
                placeholder="(11) 99999-9999"
              />
            </label>
          ) : null}
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white">Senha</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="field"
            placeholder="Mínimo 8 caracteres, letra e número"
          />
          {mode === "register" ? (
            <span className="text-xs text-white/50">Use pelo menos 8 caracteres, com letras e números.</span>
          ) : null}
        </label>

        <div aria-live="polite" className="min-h-6 text-sm">
          {feedbackError ? <p className="font-medium text-red-300">{feedbackError}</p> : null}
          {!feedbackError && message ? <p className="font-medium text-emerald-300">{message}</p> : null}
        </div>

        <button type="submit" disabled={isPending} className="btn btn-primary focus-ring w-full">
          {isPending
            ? "Processando..."
            : mode === "login"
              ? "Entrar"
              : quickRegister
                ? "Criar conta e continuar"
                : "Criar conta"}
        </button>
      </form>

      {bottomLink ? <div className="mt-6 text-center text-sm text-white/65">{bottomLink}</div> : null}

      {showModeToggle && mode === "login" ? (
        <p className="mt-4 text-center text-sm text-white/60">
          Novo por aqui?{" "}
          <Link
            href={returnTo ? `/cadastro?returnTo=${encodeURIComponent(returnTo)}` : "/cadastro"}
            className="font-semibold text-cyan-300 underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      ) : null}
      {showModeToggle && mode === "register" ? (
        <p className="mt-4 text-center text-sm text-white/60">
          Já tem conta?{" "}
          <Link
            href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
            className="font-semibold text-cyan-300 underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      ) : null}
    </div>
  );
}
