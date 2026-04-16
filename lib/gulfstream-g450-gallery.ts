/**
 * Gulfstream G450 — gallery order: base image first (catalog cover), then 1–7.
 * Files live in `public/privatejets/gulfstreamg450/`.
 */
export const GULFSTREAM_G450_GALLERY_PATHS = [
  "/privatejets/gulfstreamg450/gulfstreamg450.webp",
  ...Array.from(
    { length: 7 },
    (_, i) => `/privatejets/gulfstreamg450/gulfstreamg450-${i + 1}.webp`,
  ),
] as const;

export const GULFSTREAM_G450_GALLERY_COUNT = GULFSTREAM_G450_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GULFSTREAM_G450_CARD_COVER_SRC = GULFSTREAM_G450_GALLERY_PATHS[0];
