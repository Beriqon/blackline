import Image from "next/image";

import type { PrivateChefProfile } from "@/lib/private-chefs-data";
import { cn } from "@/lib/utils";

export function PrivateChefProfileCard({
  chef,
  compact = false,
}: {
  chef: PrivateChefProfile;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden border border-gold/12 bg-[#0a0a0a]/90 shadow-[inset_0_1px_0_0_rgba(198,164,108,0.06),0_16px_48px_-20px_rgba(0,0,0,0.55)] transition-[border-color] duration-500 ease-out hover:border-gold/22",
        compact && "h-full",
      )}
      aria-labelledby={`chef-${chef.id}-name`}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden border-b border-gold/10",
          compact ? "aspect-[3/4]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={chef.image}
          alt={chef.imageAlt}
          fill
          sizes={
            compact
              ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              : "(max-width: 1024px) 100vw, 33vw"
          }
          className="object-cover object-top brightness-[0.9] contrast-[1.05] saturate-[0.92]"
        />
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          compact ? "p-4 sm:p-4" : "p-6 sm:p-8",
        )}
      >
        <p
          className={cn(
            "font-medium uppercase tracking-[0.38em] text-gold/75",
            compact
              ? "text-[0.55rem] tracking-[0.32em]"
              : "text-[0.62rem]",
          )}
        >
          {chef.role}
        </p>
        <h3
          id={`chef-${chef.id}-name`}
          className={cn(
            "mt-2 font-serif tracking-tight text-cream",
            compact ? "text-base sm:text-[1.05rem]" : "mt-3 text-xl sm:text-[1.45rem]",
          )}
        >
          {chef.name}
        </h3>
        <p
          className={cn(
            "mt-2 flex-1 leading-relaxed text-cream/58",
            compact
              ? "line-clamp-4 text-[0.75rem] sm:text-[0.8125rem]"
              : "mt-4 text-[0.875rem] sm:text-[0.9375rem]",
          )}
        >
          {chef.bio}
        </p>
        <ul
          className={cn(
            "border-t border-gold/10",
            compact ? "mt-3 space-y-2 pt-3" : "mt-6 space-y-3 pt-6",
          )}
          role="list"
        >
          {(compact ? chef.highlights.slice(0, 2) : chef.highlights).map(
            (line) => (
              <li key={line} className="flex gap-2">
                <span
                  className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full bg-gold/50"
                  aria-hidden
                />
                <span
                  className={cn(
                    "leading-snug text-cream/72",
                    compact ? "text-[0.7rem] sm:text-xs" : "text-[0.8125rem] sm:text-sm",
                  )}
                >
                  {line}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>
    </article>
  );
}
