/**
 * Dassault Falcon 2000 — gallery order: base image first (catalog cover), then 1–5.
 * Files live in `public/privatejets/falcon2000/`.
 */
export const FALCON_2000_GALLERY_PATHS = [
  "/privatejets/falcon2000/falcon2000.webp",
  ...Array.from(
    { length: 5 },
    (_, i) => `/privatejets/falcon2000/falcon2000-${i + 1}.webp`,
  ),
] as const;

export const FALCON_2000_GALLERY_COUNT = FALCON_2000_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const FALCON_2000_CARD_COVER_SRC = FALCON_2000_GALLERY_PATHS[0];
