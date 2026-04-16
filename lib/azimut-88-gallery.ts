/**
 * 88 Azimut 2023 — gallery order: hero first (`88azimut2023.jpg`), then `88azimut2023-1` … `-11`.
 * Files live in `public/yachts/88azimut2023/`.
 */
export const AZIMUT_88_GALLERY_PATHS = [
  "/yachts/88azimut2023/88azimut2023.jpg",
  ...Array.from(
    { length: 11 },
    (_, i) => `/yachts/88azimut2023/88azimut2023-${i + 1}.jpg`,
  ),
] as const;

export const AZIMUT_88_GALLERY_COUNT = AZIMUT_88_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const AZIMUT_88_CARD_COVER_SRC = AZIMUT_88_GALLERY_PATHS[0];
