"use client";

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

type EditableCookiePreferences = Pick<CookieConsentPreferences, "marketing" | "analytics">;

type CookieToggleCardProps = {
  checked: boolean;
  description: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  title: string;
};

function CookieToggleCard({ checked, description, disabled = false, onChange, title }: CookieToggleCardProps) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "surface-card flex items-start justify-between gap-4 p-4 sm:p-5",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink sm:text-[0.98rem]">{title}</span>
          {disabled ? (
            <span className="rounded-full border border-black/10 bg-black/[0.04] px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-black/52">
              Sempre ativo
            </span>
          ) : null}
        </div>
        <p className="max-w-[42rem] text-sm leading-6 text-black/62">{description}</p>
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
            "flex h-8 w-14 items-center rounded-full border border-black/10 p-1 transition duration-200",
            checked ? "bg-ink shadow-[0_14px_30px_rgba(15,15,15,0.16)]" : "bg-black/[0.08]",
            !disabled && "peer-focus-visible:outline peer-focus-visible:outline-4 peer-focus-visible:outline-cyan/15",
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
    consentSummary = "marketing ativo e analytics desativado";
  } else if (preferences.analytics) {
    consentSummary = "analytics ativo e marketing desativado";
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
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-5 sm:pb-5 lg:px-8"
        >
          <div className="pointer-events-auto mx-auto max-w-[1600px]">
            <div className="panel relative overflow-hidden rounded-[30px] border-black/12 px-5 py-4 shadow-[0_24px_60px_rgba(15,15,15,0.12)] sm:px-6 sm:py-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-magenta to-yellow" />

              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-2">
                  <p className="label-kicker">Privacidade Prismarq</p>
                  <h2 className="display-title text-xl font-semibold tracking-[-0.04em] text-ink sm:text-[1.65rem]">
                    Usamos cookies para deixar sua navegacao mais fluida, segura e relevante.
                  </h2>
                  <p className="text-sm leading-6 text-black/62 sm:text-[0.96rem]">
                    Os cookies essenciais mantem o site funcionando. Com sua autorizacao, tambem ativamos recursos de marketing e analytics para aprimorar campanhas e entender melhor o uso da plataforma.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setIsModalOpen(true)} className="btn btn-secondary focus-ring">
                    Configurar
                  </button>
                  <button type="button" onClick={handleAcceptAll} className="btn btn-primary focus-ring">
                    Aceitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="focus-ring fixed bottom-4 left-4 z-[60] rounded-full border border-black/10 bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/58 shadow-[0_12px_28px_rgba(15,15,15,0.08)] transition hover:-translate-y-0.5 hover:text-ink"
        >
          Cookies
        </button>
      )}

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
                "panel relative w-full overflow-hidden rounded-[32px] border-black/12 p-5 shadow-[0_32px_90px_rgba(15,15,15,0.18)] transition duration-200 sm:p-6",
                isModalOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]",
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-magenta to-yellow" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="label-kicker">Preferencias de cookies</p>
                    <h2 id="cookie-consent-title" className="display-title text-2xl font-semibold tracking-[-0.05em] text-ink sm:text-[2rem]">
                      Ajuste sua experiencia com total clareza.
                    </h2>
                    <p id="cookie-consent-description" className="max-w-2xl text-sm leading-6 text-black/62 sm:text-[0.96rem]">
                      Voce decide quais categorias opcionais a Prismarq pode usar. Os cookies essenciais permanecem ativos para garantir autenticacao, seguranca e continuidade dos fluxos atuais.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Fechar configuracao"
                    onClick={() => setIsModalOpen(false)}
                    className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:bg-black/[0.03]"
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
                    description="Necessarios para autenticacao, estabilidade da navegacao, seguranca e funcionamento basico do carrinho, pedidos e demais fluxos ja existentes."
                    checked
                    disabled
                  />
                  <CookieToggleCard
                    title="Marketing"
                    description="Permite ativar recursos voltados a campanhas, remarketing e comunicacao mais alinhada ao seu interesse."
                    checked={preferences.marketing}
                    onChange={(checked) => setPreferences((current) => ({ ...current, marketing: checked }))}
                  />
                  <CookieToggleCard
                    title="Analytics"
                    description="Ajuda a entender como o site e os fluxos sao utilizados, apoiando melhorias continuas sem alterar a experiencia atual."
                    checked={preferences.analytics}
                    onChange={(checked) => setPreferences((current) => ({ ...current, analytics: checked }))}
                  />
                </div>

                <div className="surface-soft mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-black/62">
                    Selecao atual: <span className="font-semibold text-ink">{consentSummary}</span>.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={handleAcceptAll} className="btn btn-secondary focus-ring">
                      Aceitar todos
                    </button>
                    <button type="button" onClick={() => saveConsent(preferences)} className="btn btn-primary focus-ring">
                      Salvar preferencias
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
