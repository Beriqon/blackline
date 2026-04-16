/**
 * 97 San Lorenzo — gallery order: hero (`97sanlorenzo.jpg`), then `97sanlorenzo1.jpg` … `97sanlorenzo9.jpg`.
 * Files live in `public/yachts/97sanlorenzo/`.
 */
export const SAN_LORENZO_97_GALLERY_PATHS = [
  "/yachts/97sanlorenzo/97sanlorenzo.jpg",
  ...Array.from(
    { length: 9 },
    (_, i) => `/yachts/97sanlorenzo/97sanlorenzo${i + 1}.jpg`,
  ),
] as const;

export const SAN_LORENZO_97_GALLERY_COUNT = SAN_LORENZO_97_GALLERY_PATHS.length;

export const SAN_LORENZO_97_CARD_COVER_SRC: string | undefined =
  SAN_LORENZO_97_GALLERY_PATHS[0];
