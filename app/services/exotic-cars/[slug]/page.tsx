import {publishedProduct} from "@/lib/catalog-server";
import { notFound } from "next/navigation";
import { ExoticCarProduct } from "@/components/exotic-car-product";
import { EXOTIC_CARS_DAILY } from "@/lib/exotic-cars-data";
import { getI18n } from "@/lib/i18n/server";
import { localizeExoticCar } from "@/lib/i18n/exotic-cars-page";
type Props = {
    params: Promise<{
        slug: string;
    }>;
};
export function generateStaticParams() { return EXOTIC_CARS_DAILY.map(car => ({ slug: car.id })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const car = await publishedProduct("exotic-cars",slug,EXOTIC_CARS_DAILY.find(c => c.id === slug)); const { locale, t } = await getI18n(); if (!car)
    return { title: t("nav.exoticCars") }; const localized = localizeExoticCar(car, locale, t); return { title: localized.name + " — " + t("nav.exoticCars"), description: localized.description }; }
export default async function ExoticCarPage({ params }: Props) { const { slug } = await params; const car = await publishedProduct("exotic-cars",slug,EXOTIC_CARS_DAILY.find(c => c.id === slug)); if (!car)
    notFound(); return <ExoticCarProduct car={car}/>; }
