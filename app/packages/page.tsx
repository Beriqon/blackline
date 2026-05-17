import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CustomPackageWhatsApp } from "@/components/custom-package-whatsapp";
import { SectionReveal } from "@/components/section-reveal";
import { getPackageCards, type PackageCardData } from "@/lib/i18n/packages-page";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t("common.packages"),
    description: t("packagesPage.metaDescription"),
  };
}

const btnGhost =
  "inline-flex min-h-11 items-center justify-center border border-gold/25 bg-transparent px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/55 hover:text-gold-secondary hover:shadow-[0_0_36px_rgba(198,164,108,0.12)] active:translate-y-0";

const btnOutlineStrong =
  "inline-flex min-h-11 items-center justify-center border-2 border-gold/50 bg-transparent px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold-secondary hover:shadow-[0_0_40px_rgba(198,164,108,0.14)] active:translate-y-0";

function PackageCardView({
  pkg,
  indicativeNote,
}: {
  pkg: PackageCardData;
  indicativeNote: string;
}) {
  const highlight = pkg.variant === "highlight";

  return (
    <Link
      href={pkg.cta.href}
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
    >
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden border bg-[#0a0a0a]/90 transition-[border-color,box-shadow,transform] duration-500 ease-out",
          highlight
            ? "z-10 border-gold/40 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.12),0_28px_72px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(198,164,108,0.12),0_0_48px_-8px_rgba(198,164,108,0.14)] group-hover:border-gold/55 group-hover:shadow-[inset_0_1px_0_0_rgba(198,164,108,0.14),0_32px_80px_-24px_rgba(0,0,0,0.72),0_0_0_1px_rgba(198,164,108,0.18),0_0_56px_-6px_rgba(198,164,108,0.2)]"
            : "border-gold/12 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] group-hover:border-gold/24",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            highlight
              ? "min-h-[210px] sm:min-h-[230px] lg:min-h-[260px]"
              : "min-h-[200px] sm:min-h-[220px]",
          )}
        >
          <Image
            src={pkg.image}
            alt={pkg.imageAlt}
            fill
            sizes={
              highlight
                ? "(max-width: 1024px) 100vw, 38vw"
                : "(max-width: 1024px) 100vw, 28vw"
            }
            className={cn(
              "object-cover transition duration-[750ms] ease-out group-hover:scale-[1.04] group-hover:brightness-[1.02]",
              highlight
                ? "brightness-[0.92] contrast-[1.05] saturate-[0.95]"
                : "brightness-[0.88] contrast-[1.06] saturate-[0.92]",
            )}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/90 via-[#0b0b0b]/25 to-transparent"
            aria-hidden
          />
        </div>

        <div
          className={cn(
            "relative flex flex-1 flex-col border-t border-gold/10",
            highlight ? "p-6 sm:p-8 lg:p-9" : "p-6 sm:p-8",
          )}
        >
          <div
            className={cn(
              "absolute top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent",
              highlight ? "inset-x-6 sm:inset-x-8 lg:inset-x-9" : "inset-x-6 sm:inset-x-8",
            )}
            aria-hidden
          />
          <p
            className={cn(
              "text-[0.62rem] font-medium uppercase tracking-[0.38em]",
              highlight ? "text-gold/90" : "text-gold/75",
            )}
          >
            {pkg.eyebrow}
          </p>
          <h2
            className={cn(
              "mt-3 font-serif tracking-tight text-cream",
              highlight
                ? "text-xl sm:text-[1.4rem] lg:text-[1.5rem]"
                : "text-xl sm:text-[1.35rem]",
            )}
          >
            {pkg.title}
          </h2>
          <p
            className={cn(
              "mt-3 leading-relaxed",
              highlight ? "text-[0.95rem] text-cream/62" : "text-[0.9375rem] text-cream/58",
            )}
          >
            {pkg.tagline}
          </p>
          <ul className="mt-6 space-y-0" role="list">
            {pkg.includes.map((item) => (
              <li
                key={item}
                className="border-t border-gold/[0.09] py-3.5 first:border-t-0 first:pt-0 first:pb-3.5"
              >
                <div className="flex gap-3">
                  <span
                    className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-gold/50 shadow-[0_0_0_3px_rgba(198,164,108,0.08)]"
                    aria-hidden
                  />
                  <span className="text-[0.875rem] leading-snug text-cream/78">
                    {item}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {pkg.note && (
            <p className="mt-4 text-[0.7rem] leading-relaxed text-cream/40">
              {pkg.note}
            </p>
          )}
          <p className="mt-6 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/55">
            {indicativeNote}
          </p>
          <span
            className={cn(
              btnOutlineStrong,
              "mt-5 inline-flex w-full sm:w-auto",
            )}
          >
            {pkg.cta.label}
          </span>
        </div>
      </article>
    </Link>
  );
}

export default async function PackagesPage() {
  const { t } = await getI18n();
  const packages = getPackageCards(t);
  const indicativeNote = t("packagesPage.indicativeNote");

  return (
    <>
      <section className="relative min-h-[min(52vh,560px)] overflow-hidden border-b border-gold/10 bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-bg-drift relative h-full w-full">
            <Image
              src="https://images.unsplash.com/photo-1602002418816-5c2ae2862829?auto=format&fit=crop&q=88&w=2400"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_40%] brightness-[0.82] contrast-[1.08] saturate-[0.92]"
            />
          </div>
          <div className="absolute inset-0 bg-[#0b0b0b]/72" aria-hidden />
          <div className="absolute inset-0 bg-charcoal/18" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/88 via-[#0b0b0b]/38 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(52vh,560px)] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="w-full max-w-[min(44rem,100%)] text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-gold">
              {t("packagesPage.eyebrow")}
            </p>
            <div className="mt-5 h-px w-14 bg-gold/35" aria-hidden />
            <h1 className="hero-headline-in mt-6 font-serif text-[2.35rem] leading-[1.12] tracking-tight text-cream sm:text-5xl md:text-[3.1rem] lg:text-[3.35rem]">
              {t("packagesPage.headline")}
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.65] text-cream/72 sm:text-base">
              {t("packagesPage.heroBody")}
            </p>
            <div className="hero-cta-in mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link href="/packages#custom-package-builder" className={btnOutlineStrong}>
                {t("packagesPage.customPackage")}
              </Link>
              <Link href="/services" className={btnGhost}>
                {t("packagesPage.browseServices")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal className="border-b border-gold/10 bg-charcoal py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              {t("packagesPage.signatureEyebrow")}
            </p>
            <div
              className="mx-auto mt-4 h-px w-14 bg-gold/30 lg:mx-0"
              aria-hidden
            />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl md:text-[2.1rem]">
              {t("packagesPage.signatureHeadline")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-[0.9375rem]">
              {t("packagesPage.signatureBody")}
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.24fr)_minmax(0,0.88fr)] lg:items-stretch lg:gap-6 xl:gap-8">
            {packages.map((p) => (
              <PackageCardView
                key={p.id}
                pkg={p}
                indicativeNote={indicativeNote}
              />
            ))}
          </div>
        </div>
      </SectionReveal>

      <div className="section-gradient-divider" aria-hidden />

      <SectionReveal
        id="custom-package-builder"
        className="scroll-mt-24 border-b border-gold/10 bg-background py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center lg:mx-auto lg:max-w-3xl">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.5em] text-gold/90">
              {t("packagesPage.yourItinerary")}
            </p>
            <div className="mx-auto mt-4 h-px w-14 bg-gold/30" aria-hidden />
            <h2 className="mt-5 font-serif text-2xl tracking-tight text-cream sm:text-3xl">
              {t("packagesPage.customPackageTitle")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/58">
              {t("packagesPage.customPackageBody")}
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-sm border border-gold/12 bg-[#070707]/90 p-6 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_24px_64px_-24px_rgba(0,0,0,0.65)] sm:p-8 lg:p-10">
            <CustomPackageWhatsApp idSuffix="packages" />
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
