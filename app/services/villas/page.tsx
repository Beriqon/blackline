import type { Metadata } from "next";

import { VillasCatalog } from "@/components/villas-catalog";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("villasPage.metaTitle"),
    description: t("villasPage.metaDescription"),
  };
}

export default function VillasPage() {
  return <VillasCatalog />;
}
