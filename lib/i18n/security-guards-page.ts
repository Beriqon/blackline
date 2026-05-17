import { SECURITY_GUARD_RATE_CARDS } from "@/lib/security-guards-data";
import type { Translator } from "@/lib/i18n/translate";

const CARD_KEYS = {
  unarmed: {
    eyebrow: "securityGuardsPage.cards.unarmed.eyebrow",
    title: "securityGuardsPage.cards.unarmed.title",
    minimum: "securityGuardsPage.cards.unarmed.minimum",
    cartTitle: "securityGuardsPage.cards.unarmed.cartTitle",
    line1: "securityGuardsPage.cards.unarmed.line1",
    line2: "securityGuardsPage.cards.unarmed.line2",
  },
  armed: {
    eyebrow: "securityGuardsPage.cards.armed.eyebrow",
    title: "securityGuardsPage.cards.armed.title",
    minimum: "securityGuardsPage.cards.armed.minimum",
    cartTitle: "securityGuardsPage.cards.armed.cartTitle",
    line1: "securityGuardsPage.cards.armed.line1",
    line2: "securityGuardsPage.cards.armed.line2",
  },
} as const;

export type SecurityGuardRateCardDisplay = {
  id: (typeof SECURITY_GUARD_RATE_CARDS)[number]["id"];
  category: (typeof SECURITY_GUARD_RATE_CARDS)[number]["category"];
  eyebrow: string;
  title: string;
  price: string;
  hourlyRateUsd: number;
  minimum: string;
  minimumHours: number;
  minimumTotalUsd: number;
  cartTitle: string;
  lines: readonly string[];
  priceHint: string;
};

export function getSecurityGuardRateCards(t: Translator): SecurityGuardRateCardDisplay[] {
  return SECURITY_GUARD_RATE_CARDS.map((card) => {
    const keys = CARD_KEYS[card.id];
    return {
      ...card,
      eyebrow: t(keys.eyebrow),
      title: t(keys.title),
      minimum: t(keys.minimum),
      cartTitle: t(keys.cartTitle),
      lines: [t(keys.line1), t(keys.line2)] as const,
      priceHint: t("securityGuardsPage.perGuard", { price: card.price }),
    };
  });
}
