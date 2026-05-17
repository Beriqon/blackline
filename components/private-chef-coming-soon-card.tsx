import { cn } from "@/lib/utils";

export function PrivateChefComingSoonCard({
  title,
  description,
  label,
  compact = false,
}: {
  title: string;
  description: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden border border-dashed border-gold/20 bg-[#0a0a0a]/40",
        compact ? "min-h-0" : "min-h-full justify-center px-6 py-10 sm:px-8 sm:py-12",
      )}
      aria-label={title}
    >
      {compact ? (
        <>
          <div
            className="relative aspect-[3/4] w-full border-b border-dashed border-gold/15 bg-[#0b0b0b]/60"
            aria-hidden
          >
            <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl text-gold/15">
              +
            </span>
          </div>
          {motionComingSoonBody({ title, description, label })}
        </>
      ) : (
        motionComingSoonFull({ title, description, label })
      )}
    </article>
  );
}

function motionComingSoonBody({
  title,
  description,
  label,
}: {
  title: string;
  description: string;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center p-4">
      <p className="text-[0.55rem] font-medium uppercase tracking-[0.32em] text-gold/55">
        {label}
      </p>
      <h3 className="mt-2 font-serif text-base leading-snug tracking-tight text-cream/65 sm:text-[1.05rem]">
        {title}
      </h3>
      <p className="mt-2 line-clamp-3 text-[0.75rem] leading-relaxed text-cream/40 sm:text-[0.8125rem]">
        {description}
      </p>
    </div>
  );
}

function motionComingSoonFull({
  title,
  description,
  label,
}: {
  title: string;
  description: string;
  label: string;
}) {
  return (
    <>
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.38em] text-gold/55">
        {label}
      </p>
      <h3 className="mt-4 font-serif text-lg tracking-tight text-cream/70 sm:text-xl">
        {title}
      </h3>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-cream/42 sm:text-[0.9375rem]">
        {description}
      </p>
    </>
  );
}
