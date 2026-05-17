import type { Metadata } from "next";

import { YachtsCatalog } from "@/components/yachts-catalog";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("nav.yachts"),
    description: t("yachtsPage.metaDescription"),
  };
}

export default function YachtsPage() {
  return <YachtsCatalog />;
}
