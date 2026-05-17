import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, hasTranslations } from "@/lib/i18n/config";

type MessageValue = string | Messages;
export type Messages = { [key: string]: MessageValue };

function getNestedValue(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: MessageValue | undefined = messages;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function createTranslator(messages: Messages) {
  return function t(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    const value = getNestedValue(messages, key);
    if (value === undefined) {
      return interpolate(key, params);
    }
    return interpolate(value, params);
  };
}

export type Translator = ReturnType<typeof createTranslator>;

const dictionaries = new Map<Locale, Messages>();

export function registerDictionary(locale: Locale, messages: Messages): void {
  dictionaries.set(locale, messages);
}

export function getDictionary(locale: Locale): Messages {
  const effective = hasTranslations(locale) ? locale : DEFAULT_LOCALE;
  return dictionaries.get(effective) ?? dictionaries.get(DEFAULT_LOCALE) ?? {};
}

export function getTranslator(locale: Locale): Translator {
  return createTranslator(getDictionary(locale));
}
