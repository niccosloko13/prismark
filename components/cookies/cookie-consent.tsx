"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import {
  acceptedCookieConsentPreferences,
  applyCookieConsent,
  createCookieConsentState,
  defaultCookieConsentPreferences,
  persistCookieConsent,
  readCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookies";
import { cn } from "@/lib/utils";

/** Espaço acima da barra fixa de CTA (produto, carrinho, checkout) para o banner não cobrir botões. */
function storefrontStickyCtaPadding(pathname: string) {
  if (/^\/products\/[^/]+$/.test(pathname)) {
    return "max-lg:pb-[calc(env(safe-area-inset-bottom)+14.5rem)] lg:pb-8";
  }
  if (pathname === "/cart" || pathname === "/order") {
    return "max-lg:pb-[calc(env(safe-area-inset-bottom)+12.5rem)] lg:pb-8";
  }
  return "pb-3 sm:pb-5 lg:pb-8";
}

type EditableCookiePreferences = Pick<CookieConsentPreferences, "marketing" | "analytics">;

type CookieToggleCardProps = {
  checked: boolean;
  description: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  title: string;
  dark?: boolean;
};

function CookieToggleCard({ checked, description, disabled = false, onChange, title, dark = false }: CookieToggleCardProps) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-start justify-between gap-4 p-4 sm:p-5",
        disabled ? "cursor-default" : "cursor-pointer",
        dark
          ? "rounded-[22px] border border-white/8 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "surface-card",
      )}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm font-semibold sm:text-[0.98rem]", dark ? "text-white" : "text-ink")}>{title}</span>
          {disabled ? (
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em]",
                dark ? "border-white/12 bg-white/[0.06] text-white/55" : "border-black/10 bg-black/[0.04] text-black/52",
              )}
            >
              Sempre ativo
            </span>
          ) : null}
        </div>
        <p className={cn("max-w-[42rem] text-sm leading-6", dark ? "text-white/65" : "text-black/62")}>{description}</p>
      </div>

      <span className="relative mt-0.5 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "flex h-8 w-14 items-center rounded-full border p-1 transition duration-200",
            dark ? "border-white/12" : "border-black/10",
            checked ? "bg-ink shadow-[0_14px_30px_rgba(15,15,15,0.16)]" : dark ? "bg-white/[0.08]" : "bg-black/[0.08]",
            !disabled && "peer-focus-visible:outline peer-focus-visible:outline-4 peer-focus-visible:outline-cyan/25",
            disabled && "opacity-90",
          )}
        >
          <span
            className={cn(
              "h-6 w-6 rounded-full bg-white shadow-[0_10px_16px_rgba(15,15,15,0.14)] transition duration-200",
              checked ? "translate-x-6" : "translate-x-0",
            )}
          />
        </span>
      </span>
    </label>
  );
}

export function CookieConsent() {
  const pathname = usePathname() ?? "";
  const bannerPadding = storefrontStickyCtaPadding(pathname);
  const [mounted, setMounted] = useState(false);
  const [hasSavedConsent, setHasSavedConsent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<EditableCookiePreferences>({
    marketing: defaultCookieConsentPreferences.marketing,
    analytics: defaultCookieConsentPreferences.analytics,
  });
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const storedConsent = readCookieConsent();

    if (storedConsent) {
      setHasSavedConsent(true);
      setPreferences({
        marketing: storedConsent.preferences.marketing,
        analytics: storedConsent.preferences.analytics,
      });
    }

    applyCookieConsent(storedConsent);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      firstFocusable?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsModalOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [isModalOpen]);

  const shouldShowBanner = mounted && !hasSavedConsent;

  let consentSummary = "apenas cookies essenciais ativos";

  if (preferences.marketing && preferences.analytics) {
    consentSummary = "marketing e analytics ativos";
  } else if (preferences.marketing) {
    consentSummary = "marketing ativo; analytics desativado";
  } else if (preferences.analytics) {
    consentSummary = "analytics ativo; marketing desativado";
  }

  function saveConsent(nextPreferences: EditableCookiePreferences) {
    const nextState = createCookieConsentState(nextPreferences);

    persistCookieConsent(nextState);
    applyCookieConsent(nextState);
    setPreferences(nextPreferences);
    setHasSavedConsent(true);
    setIsModalOpen(false);
  }

  function handleAcceptAll() {
    saveConsent({
      marketing: acceptedCookieConsentPreferences.marketing,
      analytics: acceptedCookieConsentPreferences.analytics,
    });
  }

  return (
    <>
      {shouldShowBanner ? (
        <section
          aria-label="Consentimento de cookies"
          className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-[48] px-3 sm:px-5 lg:px-8", bannerPadding)}
        >
          <div className="pointer-events-auto mx-auto max-w-[1600px]">
            <div className="relative overflow-hidden rounded-[18px] border border-white/8 bg-white/[0.04] px-3 py-2.5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[28px] sm:px-6 sm:py-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-magenta to-yellow" />

              <div className="relative flex flex-col gap-2.5 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-1 sm:space-y-2">
                  <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-cyan-300/85 sm:text-[0.68rem]">
                    Privacidade Prismarq
                  </p>
                  <h2 className="display-title text-[0.95rem] font-semibold leading-snug tracking-[-0.03em] text-white sm:text-[1.55rem] sm:leading-tight lg:text-[1.65rem]">
                    Usamos cookies para deixar sua navegação mais fluida, segura e relevante.
                  </h2>
                  <p className="hidden text-sm leading-snug text-white/72 sm:block sm:text-[0.96rem] sm:leading-6">
                    Os cookies essenciais mantêm o site funcionando. Com sua autorização, também ativamos recursos de marketing e analytics para aprimorar campanhas e entender melhor o uso da plataforma.
                  </p>
                </div>

                <div className="flex w-full flex-row gap-2 sm:w-auto sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="focus-ring inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:min-h-[44px] sm:flex-none sm:px-4 sm:text-sm"
                  >
                    Configurar
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="home-btn-gradient focus-ring min-h-[44px] flex-1 justify-center px-4 text-xs font-semibold sm:w-auto sm:min-h-[44px] sm:text-sm"
                  >
                    Aceitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {mounted ? (
        <div
          className={cn(
            "fixed inset-0 z-[80] px-4 py-6 transition duration-200 sm:px-6 lg:px-8",
            isModalOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={!isModalOpen}
        >
          <button
            type="button"
            aria-label="Fechar configuracao de cookies"
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/38 backdrop-blur-[3px]"
          />

          <div className="relative mx-auto flex h-full max-w-3xl items-end justify-center sm:items-center">
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-consent-title"
              aria-describedby="cookie-consent-description"
              className={cn(
                "relative w-full overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.04] p-5 text-white shadow-[0_32px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-200 sm:rounded-[32px] sm:p-6",
                isModalOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]",
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-magenta to-yellow" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cyan-300/85 sm:text-[0.68rem]">
                      Preferências de cookies
                    </p>
                    <h2
                      id="cookie-consent-title"
                      className="display-title text-2xl font-semibold tracking-[-0.05em] text-white sm:text-[2rem]"
                    >
                      Ajuste sua experiência com total clareza.
                    </h2>
                    <p id="cookie-consent-description" className="max-w-2xl text-sm leading-6 text-white/68 sm:text-[0.96rem]">
                      Você decide quais categorias opcionais a Prismarq pode usar. Os cookies essenciais permanecem ativos para garantir autenticação, segurança e continuidade dos fluxos atuais.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Fechar configuração de cookies"
                    onClick={() => setIsModalOpen(false)}
                    className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/12"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="m6 6 12 12" strokeLinecap="round" />
                      <path d="M18 6 6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <CookieToggleCard
                    title="Essenciais"
                    description="Necessários para autenticação, estabilidade da navegação, segurança e funcionamento básico do carrinho, pedidos e demais fluxos já existentes."
                    checked
                    disabled
                    dark
                  />
                  <CookieToggleCard
                    title="Marketing"
                    description="Permite ativar recursos voltados a campanhas, remarketing e comunicação mais alinhada ao seu interesse."
                    checked={preferences.marketing}
                    onChange={(checked) => setPreferences((current) => ({ ...current, marketing: checked }))}
                    dark
                  />
                  <CookieToggleCard
                    title="Analytics"
                    description="Ajuda a entender como o site e os fluxos são utilizados, apoiando melhorias contínuas sem alterar a experiência atual."
                    checked={preferences.analytics}
                    onChange={(checked) => setPreferences((current) => ({ ...current, analytics: checked }))}
                    dark
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 rounded-[22px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-white/68">
                    Seleção atual: <span className="font-semibold text-white">{consentSummary}</span>.
                  </p>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className="focus-ring inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                    >
                      Aceitar todos
                    </button>
                    <button type="button" onClick={() => saveConsent(preferences)} className="home-btn-gradient focus-ring w-full sm:w-auto">
                      Salvar preferências
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
