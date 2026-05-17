import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SectionReveal } from "@/components/section-reveal";
import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import { getI18n } from "@/lib/i18n/server";
import { getServiceLinks } from "@/lib/i18n/nav";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("common.about"),
    description: t("aboutPage.metaDescription"),
  };
}

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center border border-gold/40 bg-gold px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0b0b0b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-secondary hover:bg-gold-secondary hover:shadow-[0_0_0_1px_rgba(224,195,138,0.4),0_14px_48px_rgba(198,164,108,0.2)] active:translate-y-0";

const btnGhost =
  "inline-flex min-h-12 items-center justify-center border border-gold/25 bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0";

export default async function AboutPage() {
  const { t } = await getI18n();
  const serviceLinks = getServiceLinks(t);

  const principles = [
    { title: t("aboutPage.principle1Title"), body: t("aboutPage.principle1Body") },
    { title: t("aboutPage.principle2Title"), body: t("aboutPage.principle2Body") },
    { title: t("aboutPage.principle3Title"), body: t("aboutPage.principle3Body") },
  ];

  return (
    <>
      <section className="relative min-h-[min(52vh,560px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1669815503102-7c417112b3eb?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_42%] brightness-[0.82] contrast-[1.08] saturate-[0.92]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/74" aria-hidden />
          <div className="absolute inset-0 bg-charcoal/18" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/90 via-[#0b0b0b]/45 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(52vh,560px)] max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="w-full max-w-[min(40rem,100%)] text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              {t("aboutPage.eyebrow")}
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[2.2rem] leading-[1.12] tracking-tight text-cream sm:text-5xl md:text-[3rem] lg:text-[3.35rem]">
              {t("aboutPage.headline")}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              {t("aboutPage.heroBodyBefore")}{" "}
              <span className="text-cream/82">
                {t("aboutPage.heroBodyHighlight")}
              </span>{" "}
              {t("aboutPage.heroBodyAfter")}
            </p>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20"
        aria-labelledby="about-story-heading"
      >
        <div className="mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
              {t("aboutPage.whoWeAre")}
            </p>
            <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
            <h2
              id="about-story-heading"
              className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
            >
              {t("aboutPage.storyHeadline")}
            </h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
              <p>
                {t("aboutPage.storyP1")}
                <span className="text-cream/78">
                  {t("aboutPage.storyP1Highlight")}
                </span>
                {t("aboutPage.storyP1After")}
              </p>
              <p>
                {t("aboutPage.storyP2Before")}
                <span className="text-cream/78">
                  {t("aboutPage.storyP2Highlight")}
                </span>
                {t("aboutPage.storyP2After")}
              </p>
              <p>
                {t("aboutPage.storyP3")}
              </p>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20"
        aria-labelledby="about-chauffeur-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-gold/12 bg-[#050505] shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06)] lg:order-2">
              <Image
                src="/exoticcar/chauffeur/exclusivesprinter/exclusivesprinter1.jpg"
                alt={t("aboutPage.chauffeurImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center brightness-[0.92] contrast-[1.05]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-tr from-[#0b0b0b]/55 via-transparent to-transparent"
                aria-hidden
              />
            </div>
            <div className="lg:order-1">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
                {t("aboutPage.chauffeurEyebrow")}
              </p>
              <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
              <h2
                id="about-chauffeur-heading"
                className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
              >
                {t("aboutPage.chauffeurHeadline")}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
                <p>
                  {t("aboutPage.chauffeurP1Before")}
                  <span className="text-cream/78">
                    {t("aboutPage.chauffeurP1Highlight")}
                  </span>{" "}
                  {t("aboutPage.chauffeurP1After")}
                </p>
                <p>{t("aboutPage.chauffeurP2")}</p>
              </div>
              <ul
                className="mt-8 space-y-3 border-l border-gold/22 pl-6 text-sm leading-relaxed text-cream/62 sm:text-[0.9375rem]"
                role="list"
              >
                <li className="relative">
                  <span
                    className="absolute -left-6 top-[0.45em] h-1 w-1 rounded-full bg-gold/45"
                    aria-hidden
                  />
                  {t("aboutPage.chauffeurBullet1")}
                </li>
                <li className="relative">
                  <span
                    className="absolute -left-6 top-[0.45em] h-1 w-1 rounded-full bg-gold/45"
                    aria-hidden
                  />
                  {t("aboutPage.chauffeurBullet2")}
                </li>
                <li className="relative">
                  <span
                    className="absolute -left-6 top-[0.45em] h-1 w-1 rounded-full bg-gold/45"
                    aria-hidden
                  />
                  {t("aboutPage.chauffeurBullet3")}
                </li>
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/services/chauffeur-services" className={btnPrimary}>
                  {t("aboutPage.chauffeurFleetRates")}
                </Link>
                <Link href={CONTACT_TRIP_BUILDER_HREF} className={btnGhost}>
                  {t("aboutPage.bookChauffeur")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        className="border-b border-gold/10 bg-background py-14 sm:py-16 lg:py-20"
        aria-labelledby="about-services-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            {t("aboutPage.coordinateEyebrow")}
          </p>
          <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
          <h2
            id="about-services-heading"
            className="mt-6 max-w-2xl font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]"
          >
            {t("aboutPage.servicesHeadline")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem]">
            {t("aboutPage.servicesBody")}
          </p>

          <ul
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4"
            role="list"
          >
            {serviceLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-3 border border-gold/12 bg-[#0a0a0a]/85 px-4 py-3.5 text-sm text-cream/88 transition-[border-color,background-color] duration-300 hover:border-gold/28 hover:bg-[#0d0d0d] sm:px-5 sm:py-4"
                >
                  <span className="font-medium tracking-wide">{item.label}</span>
                  <span
                    className="text-gold/45 transition-colors group-hover:text-gold-secondary"
                    aria-hidden
                  >
                    ÔåÆ
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4 border-t border-gold/10 pt-10">
            <Link href="/services" className={btnGhost}>
              {t("aboutPage.allServices")}
            </Link>
            <Link href="/packages" className={btnGhost}>
              {t("aboutPage.viewPackages")}
            </Link>
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            {t("aboutPage.howWeWorkEyebrow")}
          </p>
          <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
          <h2 className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
            {t("aboutPage.howWeWorkHeadline")}
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
            {principles.map((p) => (
              <article
                key={p.title}
                className="border-l border-gold/22 pl-6 sm:pl-7"
              >
                <h3 className="font-serif text-lg tracking-tight text-cream sm:text-[1.15rem]">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/52 sm:text-[0.9375rem]">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-background py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-gold/90">
            {t("aboutPage.miamiEyebrow")}
          </p>
          <div className="mt-4 h-px w-12 bg-gold/30" aria-hidden />
          <h2 className="mt-6 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
            {t("aboutPage.miamiHeadline")}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-cream/58 sm:text-[0.9375rem]">
            {t("aboutPage.miamiBody")}
          </p>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="relative overflow-hidden border-b border-gold/10 bg-[#070707] py-16 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(198,164,108,0.08),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-[1.65rem] leading-snug tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
            {t("aboutPage.ctaHeadline")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream/55 sm:text-[0.9375rem]">
            {t("aboutPage.ctaBody")}
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href={CONTACT_TRIP_BUILDER_HREF} className={cn(btnPrimary, "sm:min-w-[220px]")}>
              {t("aboutPage.contactUs")}
            </Link>
            <Link href="/experiences" className={btnGhost}>
              {t("aboutPage.experiencesGallery")}
            </Link>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
