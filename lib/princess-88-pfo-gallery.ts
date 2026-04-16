/**
 * 88 Princess PFO — gallery order: hero (`88princesspfo.jpg`), then `88princesspfo1.jpg` … `88princesspfo22.jpg`.
 * Files live in `public/yachts/88princesspfo/`.
 */
export const PRINCESS_88_PFO_GALLERY_PATHS = [
  "/yachts/88princesspfo/88princesspfo.jpg",
  ...Array.from(
    { length: 22 },
    (_, i) => `/yachts/88princesspfo/88princesspfo${i + 1}.jpg`,
  ),
] as const;

export const PRINCESS_88_PFO_GALLERY_COUNT =
  PRINCESS_88_PFO_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const PRINCESS_88_PFO_CARD_COVER_SRC = PRINCESS_88_PFO_GALLERY_PATHS[0];
