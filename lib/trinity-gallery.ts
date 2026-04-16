/**
 * 166 Trinity — gallery order: base image first, then numbered 1–18.
 * Files live in `public/yachts/166trinity/`.
 */
export const TRINITY_GALLERY_PATHS = [
  "/yachts/166trinity/166trinity.jpg",
  ...Array.from(
    { length: 18 },
    (_, i) => `/yachts/166trinity/166trinity${i + 1}.jpg`,
  ),
] as const;

export const TRINITY_GALLERY_COUNT = TRINITY_GALLERY_PATHS.length;

/** First gallery image — catalog card + hero cover. */
export const TRINITY_CARD_COVER_SRC = TRINITY_GALLERY_PATHS[0];
