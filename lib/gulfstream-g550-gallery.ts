/**
 * Gulfstream G550 — gallery order: base image first (catalog cover), then 1–6.
 * Files live in `public/privatejets/gulfstreamg550/`.
 */
export const GULFSTREAM_G550_GALLERY_PATHS = [
  "/privatejets/gulfstreamg550/gulfstreamg550.webp",
  ...Array.from(
    { length: 6 },
    (_, i) => `/privatejets/gulfstreamg550/gulfstreamg550-${i + 1}.webp`,
  ),
] as const;

export const GULFSTREAM_G550_GALLERY_COUNT = GULFSTREAM_G550_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GULFSTREAM_G550_CARD_COVER_SRC = GULFSTREAM_G550_GALLERY_PATHS[0];
