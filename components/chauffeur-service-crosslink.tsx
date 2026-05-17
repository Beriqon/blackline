"use client";

import Link from "next/link";

import { useTranslations } from "@/components/locale-provider";

const CROSSLINK_KEYS = {
  villa: "villasPage.chauffeurCrosslinkVilla",
  yacht: "villasPage.chauffeurCrosslinkYacht",
  jet: "villasPage.chauffeurCrosslinkJet",
} as const;

export type ChauffeurServiceCrosslinkVariant = keyof typeof CROSSLINK_KEYS;

export function ChauffeurServiceCrosslink({
  variant,
  className = "mt-4 max-w-2xl text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem]",
}: {
  variant: ChauffeurServiceCrosslinkVariant;
  className?: string;
}) {
  const t = useTranslations();

  return (
    <p className={className}>
      {t(CROSSLINK_KEYS[variant])}{" "}
      <Link
        href="/services/chauffeur-services"
        className="font-medium text-gold/88 underline decoration-gold/22 underline-offset-[0.2em] transition-colors hover:text-gold-secondary hover:decoration-gold-secondary/45"
      >
        {t("villasPage.chauffeurLink")}
      </Link>
      .
    </p>
  );
}
