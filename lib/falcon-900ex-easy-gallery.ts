/**
 * Falcon 900EX EASy — gallery order: base image first (catalog cover), then 1–3.
 * Files live in `public/privatejets/falcon900exeasy/`.
 */
export const FALCON_900EX_EASY_GALLERY_PATHS = [
  "/privatejets/falcon900exeasy/falcon900exeasy.webp",
  ...Array.from(
    { length: 3 },
    (_, i) => `/privatejets/falcon900exeasy/falcon900exeasy${i + 1}.webp`,
  ),
] as const;

export const FALCON_900EX_EASY_GALLERY_COUNT =
  FALCON_900EX_EASY_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const FALCON_900EX_EASY_CARD_COVER_SRC =
  FALCON_900EX_EASY_GALLERY_PATHS[0];
