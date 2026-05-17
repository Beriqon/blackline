import type { Translator } from "@/lib/i18n/translate";

export const SERVICE_NAV_ITEMS = [
  { href: "/services/chauffeur-services", key: "nav.chauffeur" },
  { href: "/services/exotic-cars", key: "nav.exoticCars" },
  { href: "/services/yachts", key: "nav.yachts" },
  { href: "/services/jetskis-jetcars", key: "nav.onTheWater" },
  { href: "/services/atv", key: "nav.atv" },
  { href: "/services/private-jets", key: "nav.privateJets" },
  { href: "/services/villas", key: "nav.villas" },
  { href: "/services/private-chefs", key: "nav.privateChefs" },
  { href: "/services/vip-nightlife", key: "nav.vipNightlife" },
  { href: "/services/photographer", key: "nav.photographer" },
  { href: "/services/security-guards", key: "nav.securityGuards" },
] as const;

export function getServiceLinks(t: Translator) {
  return SERVICE_NAV_ITEMS.map((item) => ({
    href: item.href,
    label: t(item.key),
  }));
}

export const MAIN_NAV_ITEMS = [
  { href: "/packages", key: "common.packages" },
  { href: "/experiences", key: "common.experiences" },
  { href: "/about", key: "common.about" },
  { href: "/contact", key: "common.contact" },
] as const;

export function getMainNavLinks(t: Translator) {
  return MAIN_NAV_ITEMS.map((item) => ({
    href: item.href,
    label: t(item.key),
  }));
}
