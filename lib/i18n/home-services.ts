import type { HomeServiceItem } from "@/lib/home-services-data";
import { HOME_SERVICES } from "@/lib/home-services-data";
import type { Translator } from "@/lib/i18n/translate";

const HOME_SERVICE_KEYS = [
  "chauffeur",
  "exotic",
  "yachts",
  "villas",
  "chefs",
  "jets",
  "water",
  "atv",
  "vip",
  "photo",
  "security",
] as const;

export function getLocalizedHomeServices(t: Translator): HomeServiceItem[] {
  return HOME_SERVICES.map((service, index) => {
    const key = HOME_SERVICE_KEYS[index];
    const base = `homeServices.${key}`;
    return {
      ...service,
      title: t(`${base}.title`),
      description: t(`${base}.description`),
      imageAlt: t(`${base}.imageAlt`),
      badge:
        "badge" in service && service.badge
          ? t(`${base}.badge`)
          : service.badge,
    };
  });
}
