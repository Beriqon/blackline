import { CHAUFFEUR_PHRASES_ES } from "@/lib/i18n/chauffeur-phrases-es";

/** Extra phrase replacements for exotic self-drive catalog copy. */
const EXOTIC_ONLY_PHRASES_ES: readonly { en: string; es: string }[] = [
  {
    en: "License & insurance required",
    es: "Licencia y seguro obligatorios",
  },
  { en: "Convertible", es: "Descapotable" },
  { en: "Coupe", es: "Coupé" },
  { en: "SUV", es: "SUV" },
  { en: "Sedan", es: "Sedán" },
  { en: "Luxury", es: "Lujo" },
  { en: "Widebody", es: "Widebody" },
  { en: "sec", es: "s" },
];

export const EXOTIC_PHRASES_ES: readonly { en: string; es: string }[] = [
  ...CHAUFFEUR_PHRASES_ES,
  ...EXOTIC_ONLY_PHRASES_ES,
];

export function applyExoticPhrasesEs(text: string): string {
  let out = text;
  const sorted = [...EXOTIC_PHRASES_ES].sort((a, b) => b.en.length - a.en.length);
  for (const { en, es } of sorted) {
    if (out.includes(en)) {
      out = out.split(en).join(es);
    }
  }
  return out;
}
