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
  const page = searchParams.get("page");
  const baseHref =
    page && /^\d+$/.test(page) && Number(page) > 1
      ? `/services/villas?page=${page}`
      : "/services/villas";
  const href = villaId ? `${baseHref}#villa-${villaId}` : baseHref;

  return (
    <Link href={href} className={className}>
      {t("villasPage.backToListings")}
    </Link>
  );
}
