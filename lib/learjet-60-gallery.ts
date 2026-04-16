/**
 * Learjet 60 — gallery order: base image first (catalog cover), then 1–4.
 * Files live in `public/privatejets/learjet60/`.
 */
export const LEARJET_60_GALLERY_PATHS = [
  "/privatejets/learjet60/learjet60.webp",
  ...Array.from(
    { length: 4 },
    (_, i) => `/privatejets/learjet60/learjet60-${i + 1}.webp`,
  ),
] as const;

export const LEARJET_60_GALLERY_COUNT = LEARJET_60_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const LEARJET_60_CARD_COVER_SRC = LEARJET_60_GALLERY_PATHS[0];
