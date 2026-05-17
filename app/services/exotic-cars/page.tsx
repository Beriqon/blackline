import type { Metadata } from "next";

import { ExoticCarsCatalog } from "@/components/exotic-cars-catalog";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("nav.exoticCars"),
    description: t("exoticCarsPage.metaDescription"),
  };
}

export default function ExoticCarsPage() {
  return <ExoticCarsCatalog />;
}
