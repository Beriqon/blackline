import { TRINITY_TAX_RATE, formatUsd } from "./trinity-pricing";

/** Florida-style charter add-ons for 97 San Lorenzo — tax on charter; gratuity on charter. */
export const SAN_LORENZO_97_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 6_500 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 8_000 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 9_500 },
] as const;

export const SAN_LORENZO_97_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type SanLorenzo97GratuityPct = (typeof SAN_LORENZO_97_GRATUITY_PCTS)[number];

export function computeSanLorenzo97Totals(
  baseUsd: number,
  gratuityPct: SanLorenzo97GratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export { formatUsd };
