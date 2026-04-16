/**
 * 96 Sunseeker — gallery order: hero (`96sunseeker.jpg`), then `96sunseeker1.jpg` … `96sunseeker14.jpg`.
 * Files live in `public/yachts/96sunseeker/`.
 */
export const SUNSEEKER_96_GALLERY_PATHS = [
  "/yachts/96sunseeker/96sunseeker.jpg",
  ...Array.from(
    { length: 14 },
    (_, i) => `/yachts/96sunseeker/96sunseeker${i + 1}.jpg`,
  ),
] as const;

export const SUNSEEKER_96_GALLERY_COUNT = SUNSEEKER_96_GALLERY_PATHS.length;

export const SUNSEEKER_96_CARD_COVER_SRC: string | undefined =
  SUNSEEKER_96_GALLERY_PATHS[0];
