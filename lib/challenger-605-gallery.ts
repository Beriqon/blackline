/**
 * Challenger 605 — gallery order: base image first (catalog cover), then 1–5.
 * Files live in `public/privatejets/challenger605/`.
 */
export const CHALLENGER_605_GALLERY_PATHS = [
  "/privatejets/challenger605/challenger605.webp",
  ...Array.from(
    { length: 5 },
    (_, i) => `/privatejets/challenger605/challenger605-${i + 1}.webp`,
  ),
] as const;

export const CHALLENGER_605_GALLERY_COUNT = CHALLENGER_605_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const CHALLENGER_605_CARD_COVER_SRC = CHALLENGER_605_GALLERY_PATHS[0];
