/**
 * Global Express — gallery order: base image first (catalog cover), then 1–10.
 * Files live in `public/privatejets/globalexpress/`.
 */
export const GLOBAL_EXPRESS_GALLERY_PATHS = [
  "/privatejets/globalexpress/globalexpress.webp",
  ...Array.from(
    { length: 10 },
    (_, i) => `/privatejets/globalexpress/globalexpress${i + 1}.webp`,
  ),
] as const;

export const GLOBAL_EXPRESS_GALLERY_COUNT = GLOBAL_EXPRESS_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GLOBAL_EXPRESS_CARD_COVER_SRC = GLOBAL_EXPRESS_GALLERY_PATHS[0];
