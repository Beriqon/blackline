"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useTranslations } from "@/components/locale-provider";

export function VillaStaysBackLink({
  className,
  villaId,
}: {
  className?: string;
  villaId?: string;
}) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const retained = new URLSearchParams();
  for (const key of ["page", "q", "area", "guests", "beds", "sort", "photos"]) {
    const value = searchParams.get(key);
    if (value) retained.set(key, value);
  }
  const baseHref = "/services/villas" + (retained.size ? "?" + retained.toString() : "");
  const href = villaId ? `${baseHref}#villa-${villaId}` : baseHref;

  return (
    <Link href={href} className={className}>
      {t("villasPage.backToListings")}
    </Link>
  );
}
