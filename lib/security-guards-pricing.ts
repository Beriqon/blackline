import type { CartAddonsState } from "@/lib/cart-types";
import { SECURITY_GUARD_RATE_CARDS } from "@/lib/security-guards-data";

const armedCard = SECURITY_GUARD_RATE_CARDS.find((c) => c.id === "armed");
const unarmedCard = SECURITY_GUARD_RATE_CARDS.find((c) => c.id === "unarmed");

if (!armedCard || !unarmedCard) {
  throw new Error(
    "Missing security guard rate card config (armed/unarmed).",
  );
}

const DEPOSIT_PCT = 30;

export function computeSecurityGuardsAddonTotalUsd(
  addons: CartAddonsState,
): number {
  let total = 0;
  if (addons.securityArmed) total += armedCard!.minimumTotalUsd;
  if (addons.securityUnarmed) total += unarmedCard!.minimumTotalUsd;
  return total;
}

export function computeSecurityGuardsAddonDepositUsd(
  addons: CartAddonsState,
): number {
  const totalUsd = computeSecurityGuardsAddonTotalUsd(addons);
  return Math.round(totalUsd * (DEPOSIT_PCT / 100));
}

