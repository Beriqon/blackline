import { getLocale } from "@/lib/i18n/get-locale";
import { getTranslator, type Translator } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

export async function getI18n(): Promise<{
  locale: Locale;
  t: Translator;
}> {
  const locale = await getLocale();
  return { locale, t: getTranslator(locale) };
}
