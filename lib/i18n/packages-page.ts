import { CONTACT_TRIP_BUILDER_HREF } from "@/lib/contact-hrefs";
import type { Translator } from "@/lib/i18n/translate";

export type PackageCardData = {
  id: string;
  eyebrow: string;
  title: string;
  tagline: string;
  includes: readonly string[];
  note?: string;
  image: string;
  imageAlt: string;
  cta: { label: string; href: string };
  variant?: "highlight";
};

export function getPackageCards(t: Translator): readonly PackageCardData[] {
  return [
    {
      id: "bay-boulevard",
      eyebrow: t("packagesPage.cards.bayBoulevard.eyebrow"),
      title: t("packagesPage.cards.bayBoulevard.title"),
      tagline: t("packagesPage.cards.bayBoulevard.tagline"),
      includes: [
        t("packagesPage.cards.bayBoulevard.include1"),
        t("packagesPage.cards.bayBoulevard.include2"),
        t("packagesPage.cards.bayBoulevard.include3"),
        t("packagesPage.cards.bayBoulevard.include4"),
      ],
      note: t("packagesPage.cards.bayBoulevard.note"),
      image:
        "https://images.unsplash.com/photo-1757439402268-1da284675170?auto=format&fit=crop&q=88&w=2000",
      imageAlt: t("packagesPage.cards.bayBoulevard.imageAlt"),
      cta: {
        label: t("packagesPage.requestAvailability"),
        href: CONTACT_TRIP_BUILDER_HREF,
      },
    },
    {
      id: "weekend-signature",
      eyebrow: t("packagesPage.cards.weekendSignature.eyebrow"),
      title: t("packagesPage.cards.weekendSignature.title"),
      tagline: t("packagesPage.cards.weekendSignature.tagline"),
      includes: [
        t("packagesPage.cards.weekendSignature.include1"),
        t("packagesPage.cards.weekendSignature.include2"),
        t("packagesPage.cards.weekendSignature.include3"),
        t("packagesPage.cards.weekendSignature.include4"),
        t("packagesPage.cards.weekendSignature.include5"),
        t("packagesPage.cards.weekendSignature.include6"),
      ],
      note: t("packagesPage.cards.weekendSignature.note"),
      image:
        "https://images.unsplash.com/photo-1669815503102-7c417112b3eb?auto=format&fit=crop&q=88&w=2000",
      imageAlt: t("packagesPage.cards.weekendSignature.imageAlt"),
      cta: {
        label: t("packagesPage.planPackage"),
        href: CONTACT_TRIP_BUILDER_HREF,
      },
      variant: "highlight",
    },
    {
      id: "water-sky",
      eyebrow: t("packagesPage.cards.waterSky.eyebrow"),
      title: t("packagesPage.cards.waterSky.title"),
      tagline: t("packagesPage.cards.waterSky.tagline"),
      includes: [
        t("packagesPage.cards.waterSky.include1"),
        t("packagesPage.cards.waterSky.include2"),
        t("packagesPage.cards.waterSky.include3"),
        t("packagesPage.cards.waterSky.include4"),
        t("packagesPage.cards.waterSky.include5"),
      ],
      note: t("packagesPage.cards.waterSky.note"),
      image:
        "https://images.unsplash.com/photo-1603377817563-5ccd33e57d05?auto=format&fit=crop&q=88&w=2000",
      imageAlt: t("packagesPage.cards.waterSky.imageAlt"),
      cta: {
        label: t("packagesPage.buildWaterDay"),
        href: CONTACT_TRIP_BUILDER_HREF,
      },
    },
  ];
}
