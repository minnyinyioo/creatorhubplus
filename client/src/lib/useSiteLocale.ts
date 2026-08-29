import { useEffect } from "react";

type CookieConsentApi = { setLanguage?: (language: string) => void; showPreferences?: () => void };

declare global {
  interface Window { CookieConsent?: CookieConsentApi }
}

// "my" remains accepted so the legacy (unrouted) Burmese pages keep
// type-checking; active routes are English-only per the locale contract.
export function useSiteLocale(language: "en" | "my", title: string) {
  useEffect(() => {
    document.documentElement.classList.add("locale-changing");
    document.documentElement.lang = language;
    document.documentElement.dataset.locale = language;
    document.title = title;
    const setCookieLanguage = () => window.CookieConsent?.setLanguage?.(language);
    setCookieLanguage();
    const timer = window.setTimeout(setCookieLanguage, 120);
    const settle = window.setTimeout(() => document.documentElement.classList.remove("locale-changing"), 180);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(settle);
      document.documentElement.classList.remove("locale-changing");
    };
  }, [language, title]);
}
