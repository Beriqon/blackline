import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { YachtFleetProduct } from "@/components/yacht-fleet-product";
import { getI18n } from "@/lib/i18n/server";
import {
  getYachtProductMetadataDescription,
  localizeYacht,
} from "@/lib/i18n/yachts-page";
import { getYachtBySlug } from "@/lib/yachts-data";

export function createYachtProductPage(slug: string) {
  async function generateMetadata(): Promise<Metadata> {
    const { locale, t } = await getI18n();
    const yacht = getYachtBySlug(slug);
    if (!yacht) {
      return { title: t("nav.yachts") };
    }
    const localized = localizeYacht(yacht, locale);
    return {
      title: `${localized.name} — ${t("nav.yachts")}`,
      description: getYachtProductMetadataDescription(yacht, locale),
    };
  }

  function YachtProductPage() {
    const yacht = getYachtBySlug(slug);
    if (!yacht) notFound();
    return <YachtFleetProduct yacht={yacht} />;
  }

  return { generateMetadata, default: YachtProductPage };
}
