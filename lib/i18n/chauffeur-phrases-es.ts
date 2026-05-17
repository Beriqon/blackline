/** Longest-first phrase replacements for chauffeur fleet copy (after localizeCatalogText). */
export const CHAUFFEUR_PHRASES_ES: readonly { en: string; es: string }[] = [
  {
    en: "Chauffeur service only — self-drive is not available.",
    es: "Solo servicio con chófer — la modalidad sin chófer no está disponible.",
  },
  {
    en: "Security deposit $500–$1000 (confirmed when you book)",
    es: "Depósito de seguridad $500–$1000 (confirmado al reservar)",
  },
  {
    en: "Valid Drivers License (We Accept Foreigners)",
    es: "Licencia de conducir válida (aceptamos extranjeros).",
  },
  { en: "Debit or Credit Card", es: "Tarjeta de débito o crédito." },
  { en: "$1000 Deposit", es: "Depósito de $1000." },
  {
    en: "100 free miles/day | $4/extra mile",
    es: "100 millas gratis/día | $4/milla adicional",
  },
  { en: "Chauffeur only (driver included)", es: "Solo con chófer (chófer incluido)" },
  { en: "Chauffeur only", es: "Solo con chófer" },
  { en: "Maybach van", es: "Van Maybach" },
  { en: "Exclusive sprinter", es: "Sprinter exclusiva" },
  { en: "Royal Blue", es: "Azul real" },
  { en: "Tiffany Blue", es: "Azul Tiffany" },
  { en: "confirmed when you book", es: "confirmado al reservar" },
];

export function applyChauffeurPhrasesEs(text: string): string {
  let out = text;
  for (const { en, es } of CHAUFFEUR_PHRASES_ES) {
    if (out.includes(en)) {
      out = out.split(en).join(es);
    }
  }
  return out;
}
