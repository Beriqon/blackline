/**
 * 105 Azimut SV — gallery order: hero (`105azimutsv.jpg`), then `105azimutsv1.jpg` … `105azimutsv10.jpg`.
 * Files live in `public/yachts/105azimutsv/`.
 */
export const AZIMUT_105_SV_GALLERY_PATHS = [
  "/yachts/105azimutsv/105azimutsv.jpg",
  ...Array.from(
    { length: 10 },
    (_, i) => `/yachts/105azimutsv/105azimutsv${i + 1}.jpg`,
  ),
] as const;

export const AZIMUT_105_SV_GALLERY_COUNT = AZIMUT_105_SV_GALLERY_PATHS.length;

export const AZIMUT_105_SV_CARD_COVER_SRC: string | undefined =
  AZIMUT_105_SV_GALLERY_PATHS[0];
