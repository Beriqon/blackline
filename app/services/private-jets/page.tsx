import type { Metadata } from "next";

import { PrivateJetsCatalog } from "@/components/private-jets-catalog";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("nav.privateJets"),
    description: t("privateJetsPage.metaDescription"),
  };
}

export default function PrivateJetsPage() {
  return <PrivateJetsCatalog />;
}
