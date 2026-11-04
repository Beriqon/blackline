import {publishedProduct} from "@/lib/catalog-server";
import { notFound } from "next/navigation";
import { ChauffeurVehicleProduct } from "@/components/chauffeur-vehicle-product";
import { CHAUFFEUR_FLEET_SORTED } from "@/lib/chauffeur-fleet-data";
import { getI18n } from "@/lib/i18n/server";
import { localizeChauffeurFleetEntry } from "@/lib/i18n/chauffeur-services-page";
type Props = {
    params: Promise<{
        slug: string;
    }>;
};
export function generateStaticParams() { return CHAUFFEUR_FLEET_SORTED.map(car => ({ slug: car.id })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const car = await publishedProduct("chauffeur-services",slug,CHAUFFEUR_FLEET_SORTED.find(c => c.id === slug)); const { locale, t } = await getI18n(); if (!car)
    return { title: t("nav.chauffeur") }; const localized = localizeChauffeurFleetEntry(car, locale, t); return { title: localized.name + " — " + t("nav.chauffeur"), description: localized.description }; }
export default async function ChauffeurVehiclePage({ params }: Props) { const { slug } = await params; const car = await publishedProduct("chauffeur-services",slug,CHAUFFEUR_FLEET_SORTED.find(c => c.id === slug)); if (!car)
    notFound(); return <ChauffeurVehicleProduct car={car}/>; }
