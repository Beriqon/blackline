import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { VillaFleetProduct } from "@/components/villa-fleet-product";
import { localizeVilla } from "@/lib/i18n/villas-page";
import { getI18n } from "@/lib/i18n/server";
import { getVillaBySlug, VILLAS } from "@/lib/villas-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return VILLAS.map((villa) => ({ slug: villa.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const villa = getVillaBySlug(slug);
  if (!villa) {
    return { title: t("villasPage.productMetaFallback") };
  }
  const localized = localizeVilla(villa, locale, t);
  const description =
    localized.description.length > 155
      ? `${localized.description.slice(0, 152)}…`
      : localized.description;
  return {
    title: t("villasPage.productMetaTitle", { name: villa.name }),
    description,
  };
}

export default async function VillaPage({ params }: Props) {
  const { slug } = await params;
  const villa = getVillaBySlug(slug);
  if (!villa) notFound();
  return (
    <Suspense fallback={null}>
      <VillaFleetProduct villa={villa} />
    </Suspense>
  );
}
