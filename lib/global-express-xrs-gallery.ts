/**
 * Global Express XRS — gallery order: base image first (catalog cover), then 1–6.
 * Files live in `public/privatejets/globalexpressxrs/`.
 */
export const GLOBAL_EXPRESS_XRS_GALLERY_PATHS = [
  "/privatejets/globalexpressxrs/globalexpressxrs.webp",
  ...Array.from(
    { length: 6 },
    (_, i) => `/privatejets/globalexpressxrs/globalexpressxrs-${i + 1}.webp`,
  ),
] as const;

export const GLOBAL_EXPRESS_XRS_GALLERY_COUNT =
  GLOBAL_EXPRESS_XRS_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const GLOBAL_EXPRESS_XRS_CARD_COVER_SRC =
  GLOBAL_EXPRESS_XRS_GALLERY_PATHS[0];
