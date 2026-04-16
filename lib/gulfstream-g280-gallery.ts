/**
 * Gulfstream G280 — gallery order: base image first (catalog cover), then 1–6.
 * Files live in `public/privatejets/gulfstreamg280/`.
 */
export const GULFSTREAM_G280_GALLERY_PATHS = [
  "/privatejets/gulfstreamg280/gulfstreamg280.webp",
  ...Array.from(
    { length: 6 },
    (_, i) => `/privatejets/gulfstreamg280/gulfstreamg280-${i + 1}.webp`,
  ),
] as const;

export const GULFSTREAM_G280_GALLERY_COUNT = GULFSTREAM_G280_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GULFSTREAM_G280_CARD_COVER_SRC = GULFSTREAM_G280_GALLERY_PATHS[0];
