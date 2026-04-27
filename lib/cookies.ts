export const COOKIE_CONSENT_STORAGE_KEY = "prismarq-cookie-consent";
export const COOKIE_CONSENT_EVENT = "prismarq:cookie-consent";

export type CookieConsentPreferences = {
  essential: true;
  marketing: boolean;
  analytics: boolean;
};

export type CookieConsentState = {
  decidedAt: string;
  preferences: CookieConsentPreferences;
};

export const defaultCookieConsentPreferences: CookieConsentPreferences = {
  essential: true,
  marketing: false,
  analytics: false,
};

export const acceptedCookieConsentPreferences: CookieConsentPreferences = {
  essential: true,
  marketing: true,
  analytics: true,
};

function isCookieConsentPreferences(value: unknown): value is CookieConsentPreferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CookieConsentPreferences>;

  return (
    candidate.essential === true
    && typeof candidate.marketing === "boolean"
    && typeof candidate.analytics === "boolean"
  );
}

export function isCookieConsentState(value: unknown): value is CookieConsentState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CookieConsentState>;

  return typeof candidate.decidedAt === "string" && isCookieConsentPreferences(candidate.preferences);
}

export function createCookieConsentState(
  preferences: Pick<CookieConsentPreferences, "marketing" | "analytics">,
): CookieConsentState {
  return {
    decidedAt: new Date().toISOString(),
    preferences: {
      essential: true,
      marketing: preferences.marketing,
      analytics: preferences.analytics,
    },
  };
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    return isCookieConsentState(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function persistCookieConsent(state: CookieConsentState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures to avoid impacting existing user flows.
  }
}

export function applyCookieConsent(state: CookieConsentState | null) {
  if (typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.dataset.cookieConsent = state ? "granted" : "pending";
  root.dataset.cookieMarketing = state?.preferences.marketing ? "granted" : "denied";
  root.dataset.cookieAnalytics = state?.preferences.analytics ? "granted" : "denied";

  window.dispatchEvent(
    new CustomEvent<CookieConsentState | null>(COOKIE_CONSENT_EVENT, {
      detail: state,
    }),
  );
}
