/**
 * Gulfstream G400 — gallery order: base image first (catalog cover), then 1–4.
 * Files live in `public/privatejets/gulfstreamg400/`.
 */
export const GULFSTREAM_G400_GALLERY_PATHS = [
  "/privatejets/gulfstreamg400/gulfstreamg400.webp",
  ...Array.from(
    { length: 4 },
    (_, i) => `/privatejets/gulfstreamg400/gulfstreamg400-${i + 1}.webp`,
  ),
] as const;

export const GULFSTREAM_G400_GALLERY_COUNT = GULFSTREAM_G400_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GULFSTREAM_G400_CARD_COVER_SRC = GULFSTREAM_G400_GALLERY_PATHS[0];
