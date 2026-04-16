/**
 * 116 Azimut — gallery order: base image first, then numbered 1–9.
 * Files live in `public/yachts/116azimut/`.
 */
export const AZIMUT_116_GALLERY_PATHS = [
  "/yachts/116azimut/116azimut.jpg",
  ...Array.from(
    { length: 9 },
    (_, i) => `/yachts/116azimut/116azimut${i + 1}.jpg`,
  ),
] as const;

export const AZIMUT_116_GALLERY_COUNT = AZIMUT_116_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const AZIMUT_116_CARD_COVER_SRC = AZIMUT_116_GALLERY_PATHS[0];
