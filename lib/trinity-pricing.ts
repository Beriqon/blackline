/** Florida-style charter add-ons for 166 Trinity — tax on charter; gratuity on charter. */
export const TRINITY_TAX_RATE = 0.07;

export const TRINITY_DURATIONS = [
  { id: "4h", label: "4 hours", hours: 4, baseUsd: 30_000 },
  { id: "6h", label: "6 hours", hours: 6, baseUsd: 35_000 },
  { id: "8h", label: "8 hours", hours: 8, baseUsd: 45_000 },
] as const;

export const TRINITY_GRATUITY_PCTS = [15, 18, 20, 22] as const;
export type TrinityGratuityPct = (typeof TRINITY_GRATUITY_PCTS)[number];

export function computeTrinityTotals(
  baseUsd: number,
  gratuityPct: TrinityGratuityPct,
) {
  const taxUsd = Math.round(baseUsd * TRINITY_TAX_RATE);
  const gratuityUsd = Math.round((baseUsd * gratuityPct) / 100);
  const totalUsd = baseUsd + taxUsd + gratuityUsd;
  return { taxUsd, gratuityUsd, totalUsd };
}

export function formatUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
