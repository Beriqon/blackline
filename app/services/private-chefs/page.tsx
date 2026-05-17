import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ClientMomentsCarousel } from "@/components/client-moments-carousel";
import { PrivateChefComingSoonCard } from "@/components/private-chef-coming-soon-card";
import { PrivateChefProfileCard } from "@/components/private-chef-profile-card";
import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getServiceLinks } from "@/lib/i18n/nav";
import {
  getPrivateChefGallerySlides,
  getPrivateChefServiceCards,
  getPrivateChefVenues,
  getPrivateChefsComingSoon,
  getPrivateChefsRoster,
} from "@/lib/i18n/private-chefs-page";
import { getI18n } from "@/lib/i18n/server";
import { PRIVATE_CHEFS_COMING_SOON_COUNT, PRIVATE_CHEFS_HERO_IMAGE } from "@/lib/private-chefs-data";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("nav.privateChefs"),
    description: t("privateChefsPage.metaDescription"),
  };
}

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center border border-gold/40 bg-gold px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnOutlineStrong =
  "inline-flex min-h-12 items-center justify-center border-2 border-gold/50 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold-secondary hover:shadow-[0_0_40px_rgba(198,164,108,0.14)] active:translate-y-0";

const cardClass =
  "group relative flex flex-col border border-gold/12 bg-[#0a0a0a]/90 p-8 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] transition-[border-color] duration-500 ease-out hover:border-gold/22 sm:p-10";

const PAIR_SERVICE_HREFS = new Set([
  "/services/yachts",
  "/services/villas",
  "/services/chauffeur-services",
  "/services/vip-nightlife",
]);

export default async function PrivateChefsPage() {
  const { t } = await getI18n();
  const serviceCards = getPrivateChefServiceCards(t);
  const venues = getPrivateChefVenues(t);
  const roster = getPrivateChefsRoster(t);
  const gallerySlides = getPrivateChefGallerySlides(t);
  const comingSoon = getPrivateChefsComingSoon(t);
  const pairWithServices = getServiceLinks(t).filter(
    (s) => s.href !== "/services/private-chefs" && PAIR_SERVICE_HREFS.has(s.href),
  );

  return (
    <>
      <section className="relative min-h-[min(58vh,640px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0">
          <Image
            src={PRIVATE_CHEFS_HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.78] contrast-[1.06] saturate-[0.9]"
          />
          <div className="absolute inset-0 bg-[#0b0b0b]/74" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/88 via-[#0b0b0b]/45 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(58vh,640px)] max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-10 lg:pb-20">
          <div className="max-w-2xl">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              {t("privateChefsPage.eyebrow")}
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="mt-6 font-serif text-[2.25rem] leading-[1.1] tracking-tight text-cream sm:text-4xl md:text-[2.85rem] lg:text-[3.15rem]">
              {t("nav.privateChefs")}
            </h1>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              {t("privateChefsPage.heroBody")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={CONTACT_TRIP_BUILDER_HREF}
                className={cn(btnPrimary, "sm:min-w-[220px]")}
              >
                {t("privateChefsPage.requestChef")}
              </Link>
              <a href="#meet-the-chefs" className={btnOutlineStrong}>
                {t("privateChefsPage.meetTheChefs")}
              </a>
            </div>
            <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-cream/40">
              <a
                href="#your-chef"
                className="text-gold-secondary/90 underline-offset-8 transition-colors hover:text-gold hover:underline"
              >
                {t("privateChefsPage.yourPrivateChef")}
              </a>
              <span className="text-cream/25" aria-hidden>
                ·
              </span>
              <a
                href="#travel-chef"
                className="text-gold-secondary/90 underline-offset-8 transition-colors hover:text-gold hover:underline"
              >
                {t("privateChefsPage.travelChef")}
              </a>
            </p>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              {t("privateChefsPage.bookEyebrow")}
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              {t("privateChefsPage.bookHeadline")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              {t("privateChefsPage.bookBody")}
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start" role="list">
              {venues.map((venue) => (
                <li
                  key={venue}
                  className="border border-gold/15 bg-[#0a0a0a]/60 px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-cream/55"
                >
                  {venue}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {serviceCards.map((svc) => (
              <article
                key={svc.id}
                id={svc.id === "private-chef" ? "your-chef" : "travel-chef"}
                className={cn(cardClass, "scroll-mt-[5.5rem]")}
                aria-labelledby={`${svc.id}-title`}
              >
                <div
                  className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent sm:inset-x-8"
                  aria-hidden
                />
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/75">
                  {svc.eyebrow}
                </p>
                <h3
                  id={`${svc.id}-title`}
                  className="mt-4 font-serif text-xl tracking-tight text-cream sm:text-[1.45rem]"
                >
                  {svc.title}
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/58">
                  {svc.description}
                </p>
                <ul className="mt-8 space-y-4 border-t border-gold/10 pt-8" role="list">
                  {svc.bullets.map((line) => (
                    <li key={line} className="flex gap-3.5">
                      <span
                        className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gold/50 shadow-[0_0_0_3px_rgba(198,164,108,0.08)]"
                        aria-hidden
                      />
                      <span className="text-[0.875rem] leading-snug text-cream/78 sm:text-[0.9375rem]">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id="meet-the-chefs"
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-background py-16 sm:py-20 lg:py-24"
        aria-labelledby="meet-the-chefs-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              {t("privateChefsPage.rosterEyebrow")}
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2
              id="meet-the-chefs-heading"
              className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              {t("privateChefsPage.rosterHeadline")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              {t("privateChefsPage.rosterBody")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {roster.map((chef) => (
              <PrivateChefProfileCard key={chef.id} chef={chef} compact />
            ))}
            {Array.from({ length: PRIVATE_CHEFS_COMING_SOON_COUNT }, (_, i) => (
              <PrivateChefComingSoonCard
                key={`coming-soon-${i}`}
                compact
                title={comingSoon.title}
                description={comingSoon.description}
                label={comingSoon.label}
              />
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="scroll-mt-[5.5rem] border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24"
        aria-labelledby="chef-gallery-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              {t("privateChefsPage.galleryEyebrow")}
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2
              id="chef-gallery-heading"
              className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              {t("privateChefsPage.galleryHeadline")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              {t("privateChefsPage.galleryBody")}
            </p>
          </div>
        </div>

        <div className="mt-12 w-full max-w-7xl px-4 sm:mt-14 sm:px-6 lg:mx-auto lg:px-10">
          <ClientMomentsCarousel
            images={gallerySlides}
            intervalMs={4500}
            ariaLabel={t("privateChefsPage.galleryAria")}
          />
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-background py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              Pair with your trip
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              {t("privateChefsPage.pairHeadline")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              {t("privateChefsPage.pairBody")}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:gap-5">
            {pairWithServices.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center justify-between gap-4 border border-gold/12 bg-[#0a0a0a]/80 px-5 py-4 transition-[border-color,box-shadow] duration-300 ease-out hover:border-gold/28 hover:shadow-[0_0_0_1px_rgba(198,164,108,0.08)]"
              >
                <span className="text-sm font-medium tracking-wide text-cream/90">
                  {s.label}
                </span>
                <span
                  className="shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/80 transition group-hover:text-gold-secondary"
                  aria-hidden
                >
                  {t("privateChefsPage.pairChef")}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "sm:min-w-[220px]")}>
              {t("privateChefsPage.requestChef")}
            </Link>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-[0.8125rem] leading-relaxed text-cream/45 lg:text-left">
            {t("privateChefsPage.pairFooter")}
          </p>
        </div>
      </SectionReveal>
    </>
  );
}
