"use client";

import { useLocale } from "@/components/locale-provider";
import styles from "@/app/services/yachts/yachts.module.css";
import { cn } from "@/lib/utils";

const labelClass =
  "text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-gold/90";

export type YachtListingAboutProps = {
  tagline: string;
  quote?: string;
  paragraphs: readonly string[];
  departure?: string;
};

export function YachtListingAbout({
  tagline,
  quote,
  paragraphs,
  departure,
  className,
}: YachtListingAboutProps & { className?: string }) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "mt-10 border-t border-gold/10 pt-10",
        styles.aboutYacht,
        className,
      )}
    >
      <p className={labelClass}>{t("yachtsPage.listing.aboutThisYacht")}</p>
      <h2 className="mt-3 font-serif text-xl leading-snug text-cream/95 sm:text-2xl">
        {tagline}
      </h2>
      {quote ? (
        <p className="mt-3 text-sm italic leading-relaxed text-gold-secondary/90">
          {quote}
        </p>
      ) : null}
      <div className="mt-5 space-y-4 text-[0.8125rem] leading-relaxed text-cream/55 sm:text-[0.9375rem]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {departure ? (
        <p className="mt-5 border border-gold/[0.09] bg-[#0c0c0c] px-4 py-3 text-[0.8125rem] leading-relaxed text-cream/70">
          <span className="font-medium text-cream/85">
            {t("yachtsPage.listing.departure")}
          </span>{" "}
          {departure}
        </p>
      ) : null}
    </div>
  );
}

export type YachtListingIncludedProps = {
  included: readonly string[];
  addOnNotes?: readonly string[];
};

export type YachtListingSpecsRow = { k: string; v: string };

/** Specifications + what's included side by side so both read as primary, not footer content. */
export function YachtListingSpecsAndIncluded({
  specRows,
  included,
  addOnNotes,
  className,
}: {
  specRows: readonly YachtListingSpecsRow[];
} & YachtListingIncludedProps & { className?: string }) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "mt-10 border-t border-gold/10 pt-10 lg:mt-12",
        styles.specsYacht,
        className,
      )}
    >
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-14">
        <div>
          <p className={labelClass}>{t("yachtsPage.listing.specifications")}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {specRows.map((row) => (
              <div
                key={row.k}
                className="border border-gold/[0.08] bg-[#0c0c0c] px-4 py-3"
              >
                <dt className="text-[0.58rem] font-medium uppercase tracking-[0.28em] text-gold/65">
                  {row.k}
                </dt>
                <dd className="mt-1.5 text-[0.9375rem] text-cream/88">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className={labelClass}>{t("yachtsPage.listing.whatsIncluded")}</p>
          <ul className="mt-5 space-y-3" role="list">
            {included.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[0.9375rem] leading-snug text-cream/78"
              >
                <span
                  className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/45"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
          {addOnNotes && addOnNotes.length > 0 ? (
            <>
              <p className="mt-8 text-[0.58rem] font-medium uppercase tracking-[0.28em] text-gold/65">
                {t("yachtsPage.listing.addOnNotes")}
              </p>
              <ul className="mt-4 space-y-3" role="list">
                {addOnNotes.map((note) => (
                  <li
                    key={note}
                    className="text-[0.8125rem] leading-relaxed text-cream/55"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
