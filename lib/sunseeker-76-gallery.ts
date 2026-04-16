/**
 * 76 Sunseeker — gallery order: hero (`76sunseeker.jpg`), then `76sunseeker1.jpg` … `76sunseeker27.jpg`.
 * Files live in `public/yachts/76sunseeker/`.
 */
export const SUNSEEKER_76_GALLERY_PATHS = [
  "/yachts/76sunseeker/76sunseeker.jpg",
  ...Array.from(
    { length: 27 },
    (_, i) => `/yachts/76sunseeker/76sunseeker${i + 1}.jpg`,
  ),
] as const;

export const SUNSEEKER_76_GALLERY_COUNT = SUNSEEKER_76_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const SUNSEEKER_76_CARD_COVER_SRC = SUNSEEKER_76_GALLERY_PATHS[0];
