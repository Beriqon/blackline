/**
 * Challenger 350 — gallery order: base image first (catalog cover), then 1–4.
 * Files live in `public/privatejets/challenger350/`.
 */
export const CHALLENGER_350_GALLERY_PATHS = [
  "/privatejets/challenger350/challenger350.webp",
  ...Array.from(
    { length: 4 },
    (_, i) => `/privatejets/challenger350/challenger350-${i + 1}.webp`,
  ),
] as const;

export const CHALLENGER_350_GALLERY_COUNT = CHALLENGER_350_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const CHALLENGER_350_CARD_COVER_SRC = CHALLENGER_350_GALLERY_PATHS[0];
