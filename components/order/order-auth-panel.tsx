"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useState, useTransition } from "react";

import { sanitizeReturnTo } from "@/lib/safe-return-to";

export type OrderAuthTab = "login" | "register";

type ApiErrorPayload = {
  message?: string;
  code?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

function fieldErrorsFromApi(details: ApiErrorPayload["details"]): Record<string, string> {
  const out: Record<string, string> = {};
  if (!details?.fieldErrors) {
    return out;
  }
  for (const [key, msgs] of Object.entries(details.fieldErrors)) {
    if (msgs?.[0]) {
      out[key] = msgs[0];
    }
  }
  return out;
}

function resolveAuthFailure(data: ApiErrorPayload): { fields: Record<string, string>; form: string } {
  const fromZod = fieldErrorsFromApi(data.details);

  if (data.code === "invalid_credentials") {
    return { fields: { password: "E-mail ou senha incorretos." }, form: "" };
  }
  if (data.code === "account_inactive") {
    return {
      fields: { email: data.message ?? "Esta conta foi desativada. Entre em contato com a Prismarq." },
      form: "",
    };
  }
  if (data.code === "email_in_use") {
    return { fields: { email: data.message ?? "Já existe uma conta com este e-mail." }, form: "" };
  }
  if (data.code === "validation_error") {
    const form =
      Object.keys(fromZod).length === 0 ? (data.message ?? "Revise os campos e tente novamente.") : "";
    return { fields: fromZod, form };
  }
  if (data.code === "internal_error") {
    return { fields: {}, form: data.message ?? "Erro interno. Tente de novo em instantes." };
  }
  return {
    fields: {},
    form: data.message ?? "Não foi possível concluir. Tente novamente.",
  };
}

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

function fieldClassName(hasError: boolean) {
  return [
    "field min-h-[48px] w-full min-w-0 max-w-full rounded-xl",
    hasError ? "border-red-400/40 ring-1 ring-red-400/35" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function OrderAuthPanel({
  activeTab,
  onActiveTabChange,
  returnToPath,
  onSuccess,
  onCollapse,
}: {
  activeTab: OrderAuthTab;
  onActiveTabChange: (tab: OrderAuthTab) => void;
  returnToPath: string;
  onSuccess: () => void;
  onCollapse: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [loginFormError, setLoginFormError] = useState("");
  const [registerFormError, setRegisterFormError] = useState("");

  const safeReturn = sanitizeReturnTo(returnToPath, "client") ?? "/order";
  const googleHref = `/api/auth/google?returnTo=${encodeURIComponent(safeReturn)}`;

  const clearLoginFeedback = useCallback(() => {
    setLoginErrors({});
    setLoginFormError("");
  }, []);

  const clearRegisterFeedback = useCallback(() => {
    setRegisterErrors({});
    setRegisterFormError("");
  }, []);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearLoginFeedback();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await response.json()) as ApiErrorPayload & { user?: { id: string } };
        if (!response.ok || !data.user) {
          const { fields, form } = resolveAuthFailure(data);
          setLoginErrors(fields);
          setLoginFormError(form);
          return;
        }
        onSuccess();
        router.refresh();
      } catch {
        setLoginFormError("Erro de rede. Verifique sua conexão.");
      }
    });
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearRegisterFeedback();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) {
      setRegisterErrors({ phone: "Informe um telefone ou WhatsApp com pelo menos 8 dígitos." });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
        });
        const data = (await response.json()) as ApiErrorPayload & { user?: { id: string } };
        if (!response.ok || !data.user) {
          const { fields, form } = resolveAuthFailure(data);
          setRegisterErrors(fields);
          setRegisterFormError(form);
          return;
        }
        onSuccess();
        router.refresh();
      } catch {
        setRegisterFormError("Erro de rede. Verifique sua conexão.");
      }
    });
  };

  return (
    <div
      className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-[#0a0d14]/95 shadow-[0_20px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      role="region"
      aria-label="Entrar ou criar conta no checkout"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:px-5">
        <div
          className="flex min-w-0 flex-1 rounded-full border border-white/10 bg-black/25 p-1 sm:max-w-md"
          role="tablist"
          aria-label="Forma de acesso"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "login"}
            onClick={() => {
              onActiveTabChange("login");
              clearLoginFeedback();
              clearRegisterFeedback();
            }}
            className={
              activeTab === "login"
                ? "focus-ring min-h-[40px] flex-1 rounded-full bg-white/[0.12] px-3 text-sm font-semibold text-white shadow-inner"
                : "focus-ring min-h-[40px] flex-1 rounded-full px-3 text-sm font-medium text-white/55 transition hover:text-white/85"
            }
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "register"}
            onClick={() => {
              onActiveTabChange("register");
              clearLoginFeedback();
              clearRegisterFeedback();
            }}
            className={
              activeTab === "register"
                ? "focus-ring min-h-[40px] flex-1 rounded-full bg-white/[0.12] px-3 text-sm font-semibold text-white shadow-inner"
                : "focus-ring min-h-[40px] flex-1 rounded-full px-3 text-sm font-medium text-white/55 transition hover:text-white/85"
            }
          >
            Criar conta
          </button>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="focus-ring shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-white/55 transition hover:bg-white/[0.08] hover:text-white"
        >
          Recolher
        </button>
      </div>

      <div className="max-w-full space-y-4 overflow-x-hidden p-4 sm:p-5">
        <a
          href={googleHref}
          className="focus-ring flex w-full min-w-0 max-w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.1]"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08]">
            <GoogleMark />
          </span>
          <span className="min-w-0 truncate">Continuar com Google</span>
        </a>

        <div className="flex min-w-0 items-center gap-3">
          <span className="h-px min-w-0 flex-1 bg-white/10" />
          <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">ou e-mail</span>
          <span className="h-px min-w-0 flex-1 bg-white/10" />
        </div>

        {activeTab === "login" ? (
          <>
            {loginFormError ? (
              <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                {loginFormError}
              </p>
            ) : null}
            <form onSubmit={handleLogin} className="grid min-w-0 gap-3" noValidate>
              <label className="grid min-w-0 gap-1.5 text-sm text-white/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">E-mail</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(loginErrors.email)}
                  aria-describedby={loginErrors.email ? "order-auth-login-email-err" : undefined}
                  className={fieldClassName(Boolean(loginErrors.email))}
                  placeholder="voce@email.com"
                />
                {loginErrors.email ? (
                  <span id="order-auth-login-email-err" className="text-xs text-red-200/95">
                    {loginErrors.email}
                  </span>
                ) : null}
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm text-white/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Senha</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={8}
                  aria-invalid={Boolean(loginErrors.password)}
                  aria-describedby={loginErrors.password ? "order-auth-login-password-err" : undefined}
                  className={fieldClassName(Boolean(loginErrors.password))}
                />
                {loginErrors.password ? (
                  <span id="order-auth-login-password-err" className="text-xs text-red-200/95">
                    {loginErrors.password}
                  </span>
                ) : null}
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="home-btn-gradient focus-ring mt-1 min-h-[48px] rounded-full text-sm font-semibold disabled:opacity-50"
              >
                {isPending ? "Entrando…" : "Entrar e continuar"}
              </button>
            </form>
          </>
        ) : (
          <>
            {registerFormError ? (
              <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                {registerFormError}
              </p>
            ) : null}
            <form onSubmit={handleRegister} className="grid min-w-0 gap-3" noValidate>
              <label className="grid min-w-0 gap-1.5 text-sm text-white/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Nome completo</span>
                <input
                  name="name"
                  autoComplete="name"
                  aria-invalid={Boolean(registerErrors.name)}
                  aria-describedby={registerErrors.name ? "order-auth-reg-name-err" : undefined}
                  className={fieldClassName(Boolean(registerErrors.name))}
                  placeholder="Seu nome"
                />
                {registerErrors.name ? (
                  <span id="order-auth-reg-name-err" className="text-xs text-red-200/95">
                    {registerErrors.name}
                  </span>
                ) : null}
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm text-white/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">E-mail</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(registerErrors.email)}
                  aria-describedby={registerErrors.email ? "order-auth-reg-email-err" : undefined}
                  className={fieldClassName(Boolean(registerErrors.email))}
                  placeholder="voce@email.com"
                />
                {registerErrors.email ? (
                  <span id="order-auth-reg-email-err" className="text-xs text-red-200/95">
                    {registerErrors.email}
                  </span>
                ) : null}
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm text-white/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Telefone / WhatsApp</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(registerErrors.phone)}
                  aria-describedby={registerErrors.phone ? "order-auth-reg-phone-err" : undefined}
                  className={fieldClassName(Boolean(registerErrors.phone))}
                  placeholder="(11) 99999-9999"
                />
                {registerErrors.phone ? (
                  <span id="order-auth-reg-phone-err" className="text-xs text-red-200/95">
                    {registerErrors.phone}
                  </span>
                ) : null}
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm text-white/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Senha</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  aria-invalid={Boolean(registerErrors.password)}
                  aria-describedby={registerErrors.password ? "order-auth-reg-password-err" : undefined}
                  className={fieldClassName(Boolean(registerErrors.password))}
                />
                {registerErrors.password ? (
                  <span id="order-auth-reg-password-err" className="text-xs text-red-200/95">
                    {registerErrors.password}
                  </span>
                ) : null}
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="home-btn-gradient focus-ring mt-1 min-h-[48px] rounded-full text-sm font-semibold disabled:opacity-50"
              >
                {isPending ? "Criando conta…" : "Criar conta e continuar"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
