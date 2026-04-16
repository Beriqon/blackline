/**
 * Challenger 300 — gallery order: base image first (catalog cover), then 1–4.
 * Files live in `public/privatejets/challenger300/`.
 */
export const CHALLENGER_300_GALLERY_PATHS = [
  "/privatejets/challenger300/challenger300.webp",
  ...Array.from(
    { length: 4 },
    (_, i) => `/privatejets/challenger300/challenger300-${i + 1}.webp`,
  ),
] as const;

export const CHALLENGER_300_GALLERY_COUNT = CHALLENGER_300_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const CHALLENGER_300_CARD_COVER_SRC = CHALLENGER_300_GALLERY_PATHS[0];
