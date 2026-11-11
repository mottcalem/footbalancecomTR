export const CONSENT_KEY = "footbalance:cookie-consent:v1";
export const CONSENT_EVENT = "footbalance:cookie-consent-changed";
export const SETTINGS_EVENT = "footbalance:cookie-settings";
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;

export type CookiePreferences = { analytics: boolean; marketing: boolean; support: boolean };
export type CookieConsent = CookiePreferences & { savedAt: number; version: 1 };
export const NO_OPTIONAL_COOKIES: CookiePreferences = {
  analytics: false,
  marketing: false,
  support: false,
};

export function parseConsent(raw: string | null, now = Date.now()): CookieConsent | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (
      value?.version !== 1 ||
      typeof value.savedAt !== "number" ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > now ||
      now - value.savedAt >= MAX_AGE ||
      [value.analytics, value.marketing, value.support].some((v) => typeof v !== "boolean")
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function readConsent(): CookieConsent | null {
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
}

// Remove accessible first-party tracking cookies when an optional category is withdrawn.
export function clearOptionalCookies() {
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", ...parts.map((_, i) => `; Domain=${parts.slice(i).join(".")}`)];
  for (const cookie of document.cookie.split(";")) {
    const name = (cookie.split("=")[0] ?? "").trim();
    if (!/^(_ga|_gid|_gat|_gcl|_fbp|_fbc|_clck|_clsk|CLID|MUID|ANONCHK|MR|SM)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}; SameSite=Lax`;
    }
  }
}
