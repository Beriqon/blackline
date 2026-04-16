/**
 * 88 Sirena — gallery order: hero (`88sirena.jpg`), then `88sirena1.jpg` … `88sirena20.jpg`.
 * Files live in `public/yachts/88sirena/`.
 */
export const SIRENA_88_GALLERY_PATHS = [
  "/yachts/88sirena/88sirena.jpg",
  ...Array.from(
    { length: 20 },
    (_, i) => `/yachts/88sirena/88sirena${i + 1}.jpg`,
  ),
] as const;

export const SIRENA_88_GALLERY_COUNT = SIRENA_88_GALLERY_PATHS.length;

/** Fleet catalog card — first gallery image. */
export const SIRENA_88_CARD_COVER_SRC: string | undefined =
  SIRENA_88_GALLERY_PATHS[0];
