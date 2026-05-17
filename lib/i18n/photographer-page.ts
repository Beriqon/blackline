import type { ClientMomentSlide } from "@/components/client-moments-carousel";
import { PHOTOGRAPHER_SHOOT_SLIDES } from "@/lib/photographer-shoots-data";
import type { Translator } from "@/lib/i18n/translate";

const SLIDE_ALT_KEYS = [
  "photographerPage.slides.0",
  "photographerPage.slides.1",
  "photographerPage.slides.2",
  "photographerPage.slides.3",
  "photographerPage.slides.4",
  "photographerPage.slides.5",
  "photographerPage.slides.6",
  "photographerPage.slides.7",
  "photographerPage.slides.8",
  "photographerPage.slides.9",
  "photographerPage.slides.10",
  "photographerPage.slides.11",
  "photographerPage.slides.12",
  "photographerPage.slides.13",
  "photographerPage.slides.14",
  "photographerPage.slides.15",
  "photographerPage.slides.16",
  "photographerPage.slides.17",
  "photographerPage.slides.18",
  "photographerPage.slides.19",
  "photographerPage.slides.20",
] as const;

export function getPhotographerShootSlides(t: Translator): ClientMomentSlide[] {
  return PHOTOGRAPHER_SHOOT_SLIDES.map((slide, index) => ({
    src: slide.src,
    alt: t(SLIDE_ALT_KEYS[index] ?? SLIDE_ALT_KEYS[0]),
  }));
}

export function getPhotoShootBullets(t: Translator): readonly string[] {
  return [
    t("photographerPage.photo.bullet1"),
    t("photographerPage.photo.bullet2"),
    t("photographerPage.photo.bullet3"),
  ];
}

export function getVideoShootBullets(t: Translator): readonly string[] {
  return [
    t("photographerPage.video.bullet1"),
    t("photographerPage.video.bullet2"),
    t("photographerPage.video.bullet3"),
  ];
}
