import type { ClientMomentSlide } from "@/components/client-moments-carousel";
import { ATV_MEDIA } from "@/lib/atv-booking-data";

/** Ride gallery carousel — all stills in `public/atv/`. */
export const ATV_CAROUSEL_SLIDES: readonly ClientMomentSlide[] = [
  { src: ATV_MEDIA.gridA, alt: "ATV riders on a Miami off-road trail" },
  { src: "/atv/atvphoto1.jpg", alt: "Guests posing with ATVs after the ride" },
  { src: ATV_MEDIA.gridB, alt: "Guided ATV tour through brush and open trail" },
  { src: "/atv/atv5.webp", alt: "Riders lined up on ATVs before the tour" },
  { src: "/atv/atvphoto2.jpg", alt: "Trail crew ready to roll on ATVs" },
  { src: ATV_MEDIA.gridC, alt: "ATV and UTV group on the trail with gear" },
  { src: "/atv/atv6.webp", alt: "ATV kicking up dust on the trail" },
  { src: ATV_MEDIA.utvHero, alt: "UTV convoy on the Miami trail" },
  { src: "/atv/atvphoto3.jpg", alt: "On-trail photo moment with helmets and gear" },
  { src: "/atv/atv4.jpg", alt: "ATV on a dusty trail turn" },
  { src: ATV_MEDIA.utv2Seat, alt: "Two-seat UTV side-by-side on the trail" },
  { src: "/atv/atv7.webp", alt: "Wide trail shot with ATVs in motion" },
  { src: ATV_MEDIA.utv4Seat, alt: "Four-seat UTV with family-sized seating" },
  { src: "/atv/atv8.webp", alt: "Close-up action moment on an ATV ride" },
];
