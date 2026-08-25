import { useEffect } from "react";

type CookieConsentApi = { setLanguage?: (language: string) => void; showPreferences?: () => void };

declare global {
  interface Window { CookieConsent?: CookieConsentApi }
}

export function useSiteLocale(language: "en" | "my", title: string) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = title;
    const setCookieLanguage = () => window.CookieConsent?.setLanguage?.(language);
    setCookieLanguage();
    const timer = window.setTimeout(setCookieLanguage, 120);
    return () => window.clearTimeout(timer);
  }, [language, title]);
}
