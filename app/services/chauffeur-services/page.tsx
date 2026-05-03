import type { Metadata } from "next";
import Link from "next/link";

import {
  ChauffeurPhotographyAddonBlock,
  ChauffeurServicesCatalog,
} from "@/components/chauffeur-services-catalog";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chauffeur services",
  description:
    "Luxury chauffeur services in Miami with premium vehicles and private drivers, coordinated by Blackline concierge.",
};

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

export default function ChauffeurServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-gold/10 bg-[#0b0b0b]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_52%_at_50%_-10%,rgba(198,164,108,0.06),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.48em] text-gold/90">
            Blackline transport
          </p>
          <div className="mt-4 h-px w-14 bg-gold/30" aria-hidden />
          <h1 className="mt-6 max-w-3xl font-serif text-[2.1rem] leading-[1.12] tracking-tight text-cream sm:text-4xl md:text-[2.65rem]">
            Luxury chauffeur services
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
            A key part of Blackline is private chauffeur transportation in Miami.
            We offer a large luxury lineup with professional drivers and
            concierge scheduling from pickup to drop-off.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "sm:min-w-[220px]")}>
              Request chauffeur service
            </Link>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <section className="border-b border-gold/10 bg-[#0b0b0b] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <ChauffeurServicesCatalog />
        </div>
      </section>

      <ChauffeurPhotographyAddonBlock />
    </>
  );
}
