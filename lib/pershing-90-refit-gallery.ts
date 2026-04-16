/**
 * 90 Pershing Refit 2025 — gallery: hero (`90pershingrefit2025.jpg`), then `90pershingrefit2025-1.jpg` … `90pershingrefit2025-12.jpg`.
 * Files live in `public/yachts/90pershingrefit2025/`.
 */
export const PERSHING_90_REFIT_GALLERY_PATHS = [
  "/yachts/90pershingrefit2025/90pershingrefit2025.jpg",
  ...Array.from({ length: 12 }, (_, i) =>
    `/yachts/90pershingrefit2025/90pershingrefit2025-${i + 1}.jpg`,
  ),
] as const;

export const PERSHING_90_REFIT_GALLERY_COUNT =
  PERSHING_90_REFIT_GALLERY_PATHS.length;

export const PERSHING_90_REFIT_CARD_COVER_SRC: string | undefined =
  PERSHING_90_REFIT_GALLERY_PATHS[0];
