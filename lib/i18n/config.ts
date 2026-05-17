export const LOCALES = ["en", "es", "pt", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "bl-locale";

/** Locales with full translation dictionaries. Others fall back to English in the UI. */
export const TRANSLATED_LOCALES: readonly Locale[] = ["en", "es"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  pt: "PT",
  fr: "FR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function hasTranslations(locale: Locale): boolean {
  return TRANSLATED_LOCALES.includes(locale);
}
