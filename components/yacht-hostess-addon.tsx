import Link from "next/link";

import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { YACHT_HOSTESS_ADDON } from "@/lib/yacht-hostess-addon";
import { cn } from "@/lib/utils";

const linkSubtle =
  "text-sm font-medium tracking-wide text-gold-secondary underline-offset-8 transition-all duration-300 ease-out hover:text-gold hover:underline hover:drop-shadow-[0_0_14px_rgba(198,164,108,0.35)]";

export type YachtHostessAddonProps = {
  className?: string;
};

export function YachtHostessAddon({ className }: YachtHostessAddonProps) {
  const { headline, body, startingPrice, maxCapacityLabel, policyNote } =
    YACHT_HOSTESS_ADDON;

  return (
    <SectionReveal
      className={cn(
        "border-b border-gold/10 bg-[#0c0c0c] py-9 sm:py-10",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-gold/75">
            Add-on
          </p>
          <h2 className="mt-2 font-serif text-lg leading-snug tracking-tight text-cream sm:text-xl">
            {headline}
          </h2>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-cream/50 sm:text-sm">
            {body}
          </p>
          <p className="mt-3 text-[0.8125rem] text-cream/45 sm:text-sm">
            From {startingPrice} · Up to {maxCapacityLabel} women when
            available
          </p>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-cream/38">
            {policyNote}
          </p>
          <p className="mt-4">
            <Link
              href={CONTACT_TRIP_BUILDER_HREF}
              className={linkSubtle}
            >
              Add this in the custom package builder
            </Link>
          </p>
        </div>
      </div>
    </SectionReveal>
  );
}
