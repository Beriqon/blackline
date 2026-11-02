import type { Metadata } from "next";

import {
  ChauffeurServicesCatalog,
} from "@/components/chauffeur-services-catalog";
import { getI18n } from "@/lib/i18n/server";


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("nav.chauffeur"),
    description: t("chauffeurServicesPage.metaDescription"),
  };
}

export default function ChauffeurServicesPage() { return <ChauffeurServicesCatalog/>; }
