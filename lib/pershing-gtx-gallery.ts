/**
 * 116 Pershing GTX — gallery order: base image first, then numbered 1–20.
 * Files live in `public/yachts/116pershinggtx/`.
 */
export const PERSHING_GTX_GALLERY_PATHS = [
  "/yachts/116pershinggtx/116pershinggtx.jpg",
  ...Array.from(
    { length: 20 },
    (_, i) => `/yachts/116pershinggtx/116pershinggtx${i + 1}.jpg`,
  ),
] as const;

export const PERSHING_GTX_GALLERY_COUNT = PERSHING_GTX_GALLERY_PATHS.length;

/** First gallery image — fleet catalog card cover. */
export const PERSHING_GTX_CARD_COVER_SRC = PERSHING_GTX_GALLERY_PATHS[0];
