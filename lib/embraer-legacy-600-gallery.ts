/**
 * Embraer Legacy 600 — gallery order: base image first (catalog cover), then 1–6.
 * Files live in `public/privatejets/legacy600/`.
 */
export const EMBRAER_LEGACY_600_GALLERY_PATHS = [
  "/privatejets/legacy600/legacy600.webp",
  ...Array.from(
    { length: 6 },
    (_, i) => `/privatejets/legacy600/legacy600-${i + 1}.webp`,
  ),
] as const;

export const EMBRAER_LEGACY_600_GALLERY_COUNT =
  EMBRAER_LEGACY_600_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const EMBRAER_LEGACY_600_CARD_COVER_SRC =
  EMBRAER_LEGACY_600_GALLERY_PATHS[0];
