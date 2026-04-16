/**
 * Embraer Legacy 650 — gallery order: base image first (catalog cover), then 1–4.
 * Files live in `public/privatejets/legacy650/`.
 */
export const EMBRAER_LEGACY_650_GALLERY_PATHS = [
  "/privatejets/legacy650/legacy650.webp",
  ...Array.from(
    { length: 4 },
    (_, i) => `/privatejets/legacy650/legacy650-${i + 1}.webp`,
  ),
] as const;

export const EMBRAER_LEGACY_650_GALLERY_COUNT =
  EMBRAER_LEGACY_650_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const EMBRAER_LEGACY_650_CARD_COVER_SRC =
  EMBRAER_LEGACY_650_GALLERY_PATHS[0];
