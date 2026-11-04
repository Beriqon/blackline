import {publishedProduct} from "@/lib/catalog-server";
import { notFound } from "next/navigation";

import { YachtFleetProduct } from "@/components/yacht-fleet-product";
import { getI18n } from "@/lib/i18n/server";
import {
  getYachtProductMetadataDescription,
  localizeYacht,
} from "@/lib/i18n/yachts-page";
import { getYachtBySlug, YACHTS } from "@/lib/yachts-data";

/** These use dedicated `page.tsx` files under `services/yachts/<slug>/`. */
const LEGACY_CURATED_SLUGS = new Set([
  "166-trinity",
  "116-pershing-gtx",
  "116-azimut",
  "88-azimut-2023",
  "88-sirena",
  "105-azimut-sv",
  "96-sunseeker",
  "97-san-lorenzo",
  "90-pershing-refit-2025",
  "76-sunseeker",
  "88-princess-pfo",
]);

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return YACHTS.filter((y) => !LEGACY_CURATED_SLUGS.has(y.id)).map((y) => ({
    slug: y.id,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await getI18n();
  const { slug } = await params;
  const yacht = await publishedProduct("yachts",slug,getYachtBySlug(slug));
  if (!yacht) {
    return { title: t("nav.yachts") };
  }
  const localized = localizeYacht(yacht, locale);
  return {
    title: `${localized.name} — ${t("nav.yachts")}`,
    description: getYachtProductMetadataDescription(yacht, locale),
  };
}

export default async function FleetYachtPage({ params }: Props) {
  const { slug } = await params;
  const y = await publishedProduct("yachts",slug,getYachtBySlug(slug));
  if (!y) notFound();
  return <YachtFleetProduct yacht={y} />;
}
