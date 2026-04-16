import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { VillaFleetProduct } from "@/components/villa-fleet-product";
import { getVillaBySlug, VILLAS } from "@/lib/villas-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return VILLAS.map((villa) => ({ slug: villa.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const villa = getVillaBySlug(slug);
  if (!villa) return { title: "Villa stay" };
  return {
    title: `${villa.name} — Villa stay`,
    description:
      villa.description.length > 155
        ? `${villa.description.slice(0, 152)}…`
        : villa.description,
  };
}

export default async function VillaPage({ params }: Props) {
  const { slug } = await params;
  const villa = getVillaBySlug(slug);
  if (!villa) notFound();
  return (
    <Suspense fallback={null}>
      <VillaFleetProduct villa={villa} />
    </Suspense>
  );
}
