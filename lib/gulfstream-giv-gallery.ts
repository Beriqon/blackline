/**
 * Gulfstream GIV (non-SP) — gallery order: base image first (catalog cover), then 1–4.
 * Files live in `public/privatejets/gulfstreamgiv/`.
 */
export const GULFSTREAM_GIV_GALLERY_PATHS = [
  "/privatejets/gulfstreamgiv/gulfstreamgiv.webp",
  ...Array.from(
    { length: 4 },
    (_, i) => `/privatejets/gulfstreamgiv/gulfstreamgiv${i + 1}.webp`,
  ),
] as const;

export const GULFSTREAM_GIV_GALLERY_COUNT = GULFSTREAM_GIV_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GULFSTREAM_GIV_CARD_COVER_SRC = GULFSTREAM_GIV_GALLERY_PATHS[0];
