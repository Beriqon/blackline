import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { YachtFleetProduct } from "@/components/yacht-fleet-product";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const y = getYachtBySlug(slug);
  if (!y) return { title: "Yacht charter" };
  return {
    title: `${y.name} — Yacht charter`,
    description:
      y.description.length > 155
        ? `${y.description.slice(0, 152)}…`
        : y.description,
  };
}

export default async function FleetYachtPage({ params }: Props) {
  const { slug } = await params;
  const y = getYachtBySlug(slug);
  if (!y) notFound();
  return <YachtFleetProduct yacht={y} />;
}
