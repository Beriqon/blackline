/**
 * Gulfstream GIV-SP — gallery order: base image first (catalog cover), then 1–6.
 * Files live in `public/privatejets/gulfstreamgivsp/`.
 */
export const GULFSTREAM_GIV_SP_GALLERY_PATHS = [
  "/privatejets/gulfstreamgivsp/gulfstreamgivsp.webp",
  ...Array.from(
    { length: 6 },
    (_, i) => `/privatejets/gulfstreamgivsp/gulfstreamgivsp${i + 1}.webp`,
  ),
] as const;

export const GULFSTREAM_GIV_SP_GALLERY_COUNT = GULFSTREAM_GIV_SP_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GULFSTREAM_GIV_SP_CARD_COVER_SRC = GULFSTREAM_GIV_SP_GALLERY_PATHS[0];
