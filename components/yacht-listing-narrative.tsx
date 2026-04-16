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
  return (
    <div
      className={cn(
        "mt-10 border-t border-gold/10 pt-10",
        className,
      )}
    >
      <p className={labelClass}>About this yacht</p>
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
          <span className="font-medium text-cream/85">Departure:</span>{" "}
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

/** Specifications + what’s included side by side so both read as primary, not footer content. */
export function YachtListingSpecsAndIncluded({
  specRows,
  included,
  addOnNotes,
  className,
}: {
  specRows: readonly YachtListingSpecsRow[];
} & YachtListingIncludedProps & { className?: string }) {
  return (
    <div
      className={cn(
        "mt-10 border-t border-gold/10 pt-10 lg:mt-12",
        className,
      )}
    >
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-14">
        <div>
          <p className={labelClass}>Specifications</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {specRows.map((row) => (
              <div
                key={row.k}
                className="border border-gold/[0.09] bg-[#0c0c0c] px-4 py-3.5"
              >
                <dt className="text-[0.58rem] font-medium uppercase tracking-[0.24em] text-cream/40">
                  {row.k}
                </dt>
                <dd className="mt-1.5 font-serif text-lg text-cream/92">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <YachtListingIncluded included={included} addOnNotes={addOnNotes} />
      </div>
    </div>
  );
}

export function YachtListingIncluded({
  included,
  addOnNotes,
  className,
}: YachtListingIncludedProps & { className?: string }) {
  return (
    <div className={className}>
      <p className={labelClass}>What&apos;s included</p>
      <ul
        className="mt-4 space-y-2.5 text-[0.8125rem] leading-relaxed text-cream/58"
        role="list"
      >
        {included.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold/40"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {addOnNotes?.length ? (
        <ul
          className="mt-4 space-y-2 border-t border-gold/10 pt-4 text-[0.75rem] leading-relaxed text-cream/45"
          role="list"
        >
          {addOnNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
