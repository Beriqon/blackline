import {
  PRIVATE_CHEF_GALLERY_SLIDES,
  PRIVATE_CHEF_SERVICE_CARDS,
  PRIVATE_CHEF_VENUES,
  PRIVATE_CHEFS_ROSTER,
  type PrivateChefProfile,
} from "@/lib/private-chefs-data";
import type { ClientMomentSlide } from "@/components/client-moments-carousel";
import type { Translator } from "@/lib/i18n/translate";

const SERVICE_CARD_KEY: Record<
  (typeof PRIVATE_CHEF_SERVICE_CARDS)[number]["id"],
  "privateChef" | "travelChef"
> = {
  "private-chef": "privateChef",
  "travel-chef": "travelChef",
};

const CHEF_IDS = ["billyCrocker"] as const;

export function getPrivateChefServiceCards(t: Translator) {
  return PRIVATE_CHEF_SERVICE_CARDS.map((card) => {
    const key = SERVICE_CARD_KEY[card.id];
    return {
      ...card,
      eyebrow: t(`privateChefsPage.services.${key}.eyebrow`),
      title: t(`privateChefsPage.services.${key}.title`),
      description: t(`privateChefsPage.services.${key}.description`),
      bullets: [
        t(`privateChefsPage.services.${key}.bullet1`),
        t(`privateChefsPage.services.${key}.bullet2`),
        t(`privateChefsPage.services.${key}.bullet3`),
      ],
    };
  });
}

export function getPrivateChefVenues(t: Translator): readonly string[] {
  return PRIVATE_CHEF_VENUES.map((_, i) => t(`privateChefsPage.venue.${i}`));
}

export function getPrivateChefsRoster(t: Translator): readonly PrivateChefProfile[] {
  return PRIVATE_CHEFS_ROSTER.map((chef, index) => {
    const id = CHEF_IDS[index];
    if (!id) return chef;

    return {
      ...chef,
      role: t(`privateChefsPage.chefs.${id}.role`),
      bio: t(`privateChefsPage.chefs.${id}.bio`),
      imageAlt: t(`privateChefsPage.chefs.${id}.imageAlt`),
      highlights: [
        t(`privateChefsPage.chefs.${id}.highlight1`),
        t(`privateChefsPage.chefs.${id}.highlight2`),
        t(`privateChefsPage.chefs.${id}.highlight3`),
      ],
    };
  });
}

export function getPrivateChefGallerySlides(t: Translator): readonly ClientMomentSlide[] {
  return PRIVATE_CHEF_GALLERY_SLIDES.map((slide, index) => ({
    src: slide.src,
    alt: t(`privateChefsPage.gallery.${index}`),
  }));
}

export function getPrivateChefsComingSoon(t: Translator) {
  return {
    title: t("privateChefsPage.comingSoon.title"),
    description: t("privateChefsPage.comingSoon.description"),
    label: t("privateChefsPage.comingSoon.label"),
  };
}
