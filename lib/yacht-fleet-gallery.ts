/**
 * Optional gallery paths for fleet product pages (`public/` URLs).
 * Add folders as you upload photography — same pattern as existing yacht galleries.
 */
const PRESTIGE_75_OCEANA_GALLERY: readonly string[] = [
  "/yachts/75prestigeoceana/75prestigeoceana.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(
    (n) => `/yachts/75prestigeoceana/75prestigeoceana${n}.jpg`,
  ),
];

const SUNSEEKER_74_2023_GALLERY: readonly string[] = [
  "/yachts/74sunseeker2023/74sunseeker2023.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/74sunseeker2023/74sunseeker2023-${n}.jpg`,
  ),
];

const AZIMUT_72_7S_GALLERY: readonly string[] = [
  "/yachts/72azimut7s/72azimut7s.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const).map(
    (n) => `/yachts/72azimut7s/72azimut7s${n}.jpg`,
  ),
];

const SUNSEEKER_80_SMU_GALLERY: readonly string[] = [
  "/yachts/80sunseekersmu/80sunseekersmu.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(
    (n) => `/yachts/80sunseekersmu/80sunseekersmu${n}.jpg`,
  ),
];

const GALEON_68_2025_GALLERY: readonly string[] = [
  "/yachts/68galeon2025/68galeon2025.jpg",
  ...Array.from({ length: 21 }, (_, i) => {
    const n = i + 1;
    return `/yachts/68galeon2025/68galeon2025${n}.jpg`;
  }),
];

const GALEON_68_GALLERY: readonly string[] = [
  "/yachts/68galeon/68galeon.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/68galeon/68galeon${n}.jpg`,
  ),
];

const PRESTIGE_65_GALLERY: readonly string[] = [
  "/yachts/65prestige/65prestige.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/65prestige/65prestige${n}.jpg`,
  ),
];

const AZIMUT_64_GALLERY: readonly string[] = [
  "/yachts/64azimut/64azimut.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/64azimut/64azimut${n}.jpg`,
  ),
];

const AICON_75_GALLERY: readonly string[] = [
  "/yachts/75aicon/75aicon.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/75aicon/75aicon${n}.jpg`,
  ),
];

/** Cover .jpg, slides 1–9 .webp, slides 10–12 .jpg — matches files on disk. */
const AZIMUT_70_DAYS_LIKE_THIS_GALLERY: readonly string[] = [
  "/yachts/70azimutdayslikethis/70azimutdayslikethis.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(
    (n) =>
      `/yachts/70azimutdayslikethis/70azimutdayslikethis${n}.webp`,
  ),
  ...([10, 11, 12] as const).map(
    (n) =>
      `/yachts/70azimutdayslikethis/70azimutdayslikethis${n}.jpg`,
  ),
];

const AZIMUT_68_THE_ONE_GALLERY: readonly string[] = [
  "/yachts/68azimuttheone/68azimuttheone.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(
    (n) => `/yachts/68azimuttheone/68azimuttheone${n}.jpg`,
  ),
];

const AZIMUT_65_ALLEGRA_GALLERY: readonly string[] = [
  "/yachts/65azimutallegra/65azimutallegra.jpg",
  ...([1, 2, 3, 4, 5, 6, 7] as const).map(
    (n) => `/yachts/65azimutallegra/65azimutallegra${n}.jpg`,
  ),
];

const GALEON_53_H_GALLERY: readonly string[] = [
  "/yachts/53galeonh/53galeonh.jpg",
  ...([1, 2, 3] as const).map(
    (n) => `/yachts/53galeonh/53galeonh${n}.jpg`,
  ),
];

const AZIMUT_60_SUPREME1_GALLERY: readonly string[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(
    (n) => `/yachts/60azimutsupreme1/60azimutsupreme1-${n}.jpg`,
  ),
];

/** Folder name on disk is `60azimutesupreme2` (extra “e”). */
const AZIMUT_60_SUPREME2_GALLERY: readonly string[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const).map(
    (n) =>
      `/yachts/60azimutesupreme2/60azimutsupreme2-${n}.jpg`,
  ),
];

const PRESTIGE_52_GALLERY: readonly string[] = [
  "/yachts/52prestige/52prestige.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const).map(
    (n) => `/yachts/52prestige/52prestige${n}.jpg`,
  ),
];

const FJORD_40_GALLERY: readonly string[] = [
  "/yachts/40fjord/40fjord.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(
    (n) => `/yachts/40fjord/40fjord${n}.jpg`,
  ),
];

const FORMULA_48_GALLERY: readonly string[] = [
  "/yachts/48formula/48formula.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/48formula/48formula${n}.jpg`,
  ),
];

/** 105′ Azimut (Miami River listing) — distinct from `105-azimut-sv` / `105azimutsv`. */
const AZIMUT_105_RIVER_GALLERY: readonly string[] = [
  "/yachts/105azimut/105azimut.jpg",
  ...([1, 2, 3, 4] as const).map(
    (n) => `/yachts/105azimut/105azimut${n}.jpg`,
  ),
];

const AZIMUT_103_GALLERY: readonly string[] = [
  "/yachts/103azimut/103azimut.jpg",
  ...([1, 2, 3, 4, 5, 6, 7] as const).map(
    (n) => `/yachts/103azimut/103azimut${n}.jpg`,
  ),
];

const CUSTOM_PRIVILEGE_112_GALLERY: readonly string[] = [
  "/yachts/112customprivilege/112customprivilege.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const).map(
    (n) => `/yachts/112customprivilege/112customprivilege${n}.jpg`,
  ),
];

const SUNSEEKER_68_NASSAU_GALLERY: readonly string[] = [
  "/yachts/68sunseekernassau/68sunseekernassau.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(
    (n) => `/yachts/68sunseekernassau/68sunseekernassau${n}.jpg`,
  ),
];

const LEOPARD_105_GALLERY: readonly string[] = [
  "/yachts/105leopard/105leopard.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const).map(
    (n) => `/yachts/105leopard/105leopard${n}.jpg`,
  ),
];

/** Slide 8 is `.webp` on disk; 1–7 and 9–18 are `.jpg`. */
const SUNREEF_70_SUPREME_GALLERY: readonly string[] = [
  "/yachts/70sunreefsupreme/70sunreefsupreme.jpg",
  ...([1, 2, 3, 4, 5, 6, 7] as const).map(
    (n) => `/yachts/70sunreefsupreme/70sunreefsupreme${n}.jpg`,
  ),
  "/yachts/70sunreefsupreme/70sunreefsupreme8.webp",
  ...([9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const).map(
    (n) => `/yachts/70sunreefsupreme/70sunreefsupreme${n}.jpg`,
  ),
];

const DOMINATOR_100_GALLERY: readonly string[] = [
  "/yachts/100dominator/100dominator.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const).map(
    (n) => `/yachts/100dominator/100dominator${n}.jpg`,
  ),
];

const HORIZON_110_GALLERY: readonly string[] = [
  "/yachts/110horizon/110horizon.jpg",
  "/yachts/110horizon/110horizon1.jpg",
  "/yachts/110horizon/110horizon3.jpg",
  "/yachts/110horizon/110horizon4.jpg",
  "/yachts/110horizon/110horizon5.jpg",
  "/yachts/110horizon/110horizon6.jpg",
  "/yachts/110horizon/110horizon7.jpg",
  "/yachts/110horizon/110horizon8.jpg",
  "/yachts/110horizon/110horizon9.jpg",
  "/yachts/110horizon/110horizon10.jpg",
  "/yachts/110horizon/110horizon11.jpg",
  "/yachts/110horizon/110horizon12.jpg",
  "/yachts/110horizon/110horizon13.jpg",
  "/yachts/110horizon/110horizon14.jpg",
];

const LAGOON_56_NASSAU_GALLERY: readonly string[] = [
  "/yachts/56lagoonnassau/56lagoonnassau.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/56lagoonnassau/56lagoonnassau${n}.jpg`,
  ),
];

const AZIMUT_70_2023_GALLERY: readonly string[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/70azimut2023/70azimut2023-${n}.jpg`,
  ),
];

const AZIMUT_80_S8_GALLERY: readonly string[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/80azimuts8/80azimuts8-${n}.jpg`,
  ),
];

const AQUA_105_GALLERY: readonly string[] = [
  "/yachts/105aqua/105aqua.jpg",
  ...([1, 2, 3, 4, 5, 6, 7] as const).map(
    (n) => `/yachts/105aqua/105aqua${n}.jpg`,
  ),
];

const AZIMUT_66_2018_GALLERY: readonly string[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(
    (n) => `/yachts/66azimut2018/66azimut2018-${n}.jpg`,
  ),
];

/** Slides 9–11 and 17 are `.webp` on disk. */
const AZIMUT_88_SATI_GALLERY: readonly string[] = [
  "/yachts/88azimutsati/88azimutsati.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/88azimutsati/88azimutsati${n}.jpg`,
  ),
  "/yachts/88azimutsati/88azimutsati9.webp",
  "/yachts/88azimutsati/88azimutsati10.webp",
  "/yachts/88azimutsati/88azimutsati11.webp",
  ...([12, 13, 14, 15, 16] as const).map(
    (n) => `/yachts/88azimutsati/88azimutsati${n}.jpg`,
  ),
  "/yachts/88azimutsati/88azimutsati17.webp",
];

const AZIMUT_70_LUPO_II_GALLERY: readonly string[] = [
  "/yachts/70azimutlupoii/70azimutlupoii.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(
    (n) => `/yachts/70azimutlupoii/70azimutlupoii${n}.jpg`,
  ),
];

const AZIMUT_90_DAY_DREAMIN_GALLERY: readonly string[] = [
  "/yachts/90azimutdaydreamin/90azimutdaydreamin.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const).map(
    (n) => `/yachts/90azimutdaydreamin/90azimutdaydreamin${n}.jpg`,
  ),
];

/** Page 6 fleet — hero first, then numbered slides (same order as on disk). */
const PRINCESS_74_GALLERY: readonly string[] = [
  "/yachts/74princess/74princess.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map(
    (n) => `/yachts/74princess/74princess${n}.jpg`,
  ),
];

const SUNSEEKER_84_GALLERY: readonly string[] = [
  "/yachts/84sunseeker/84sunseeker.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/84sunseeker/84sunseeker${n}.jpg`,
  ),
];

const SUNSEEKER_80_GALLERY: readonly string[] = [
  "/yachts/80sunseeker/80sunseeker.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/80sunseeker/80sunseeker${n}.jpg`,
  ),
];

const AZIMUT_70_LE_GRAND_BLEU_GALLERY: readonly string[] = [
  "/yachts/70azimutlegrandbleu/70azimutlegrandbleu.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/70azimutlegrandbleu/70azimutlegrandbleu${n}.jpg`,
  ),
];

const SUNSEEKER_88_GALLERY: readonly string[] = [
  "/yachts/88sunseeker/88sunseeker.jpg",
  ...([1, 2, 3, 4, 5, 6, 7] as const).map(
    (n) => `/yachts/88sunseeker/88sunseeker${n}.jpg`,
  ),
];

const AZIMUT_70_211_GALLERY: readonly string[] = (
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
).map((n) => `/yachts/70azimut211/70azimut211-${n}.jpg`);

const AZIMUT_60_FREEDOM_GALLERY: readonly string[] = [
  "/yachts/60azimutfreedom/60azimutfreedom.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(
    (n) => `/yachts/60azimutfreedom/60azimutfreedom${n}.jpg`,
  ),
];

const PERSHING_62_GALLERY: readonly string[] = [
  "/yachts/62pershing/62pershing.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map(
    (n) => `/yachts/62pershing/62pershing${n}.jpg`,
  ),
];

const AICON_70_GALLERY: readonly string[] = [
  "/yachts/70aicon/70aicon.jpg",
  ...([1, 2, 3, 4, 5] as const).map(
    (n) => `/yachts/70aicon/70aicon${n}.jpg`,
  ),
];

/** Page 7 fleet — hero first, then numbered slides. */
const MARQUIS_66_GALLERY: readonly string[] = [
  "/yachts/66marquis/66marquis.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const).map(
    (n) => `/yachts/66marquis/66marquis${n}.jpg`,
  ),
];

const PARDO_43_2021_GALLERY: readonly string[] = (
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
).map((n) => `/yachts/43pardo2021/43pardo2021-${n}.jpg`);

const AZIMUT_57_THALES_GALLERY: readonly string[] = [
  "/yachts/57azimutthales/57azimutthales.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map(
    (n) => `/yachts/57azimutthales/57azimutthales${n}.jpg`,
  ),
];

const AZIMUT_55_AZURE_GALLERY: readonly string[] = [
  "/yachts/55azimutazure/55azimutazure.jpg",
  ...([1, 2, 3, 4] as const).map(
    (n) => `/yachts/55azimutazure/55azimutazure${n}.jpg`,
  ),
];

const PARDO_38_2023_GALLERY: readonly string[] = (
  [1, 2, 3, 4, 5, 6, 7] as const
).map((n) => `/yachts/38pardo2023/38pardo2023-${n}.jpg`);

const BENETEAU_52_FLY_GALLERY: readonly string[] = [
  "/yachts/52beneteaufly/52beneteaufly.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/52beneteaufly/52beneteaufly${n}.jpg`,
  ),
];

const CRUISER_48_SPORT_GALLERY: readonly string[] = [
  "/yachts/48cruisersport/48cruisersport.jpg",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/48cruisersport/48cruisersport${n}.jpg`,
  ),
];

const SEA_RAY_44_SEA_DAZE_GALLERY: readonly string[] = [
  "/yachts/44searayseadaze/44searayseadaze.jpg",
  ...([1, 2, 3, 4, 5] as const).map(
    (n) => `/yachts/44searayseadaze/44searayseadaze${n}.jpg`,
  ),
];

const SUNSEEKER_45_LA_PEDRO_GALLERY: readonly string[] = [
  "/yachts/45sunseekerlapedro/45sunseekerlapedro.JPG",
  ...([1, 2, 3, 4, 5, 6, 7] as const).map(
    (n) => `/yachts/45sunseekerlapedro/45sunseekerlapedro${n}.JPG`,
  ),
];

/** Mixed `.jpeg` / `.jpg` — order matches filenames on disk. */
const AZIMUT_58_LETZ_GO_GALLERY: readonly string[] = [
  "/yachts/58azimutletzgo/58azimutletzgo.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo1.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo2.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo3.jpg",
  "/yachts/58azimutletzgo/58azimutletzgo4.jpg",
  "/yachts/58azimutletzgo/58azimutletzgo5.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo6.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo7.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo8.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo9.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo10.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo11.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo12.jpeg",
  "/yachts/58azimutletzgo/58azimutletzgo13.jpeg",
];

const SEA_RAY_50_ONE_LOVE_GALLERY: readonly string[] = [
  "/yachts/50searayflyonelove/50searayflyonelove.png",
  ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
    (n) => `/yachts/50searayflyonelove/50searayflyonelove${n}.png`,
  ),
];

const FERRETTI_60_CATALAYA_GALLERY: readonly string[] = [
  "/yachts/60ferretticatalaya/60ferretticatalaya.png",
  ...Array.from({ length: 13 }, (_, i) => {
    const n = i + 1;
    return `/yachts/60ferretticatalaya/60ferretticatalaya${n}.png`;
  }),
];

const AZIMUT_70_ANDIAMO_GALLERY: readonly string[] = [
  "/yachts/70azimutandiamo/70azimutandiamo.png",
  ...Array.from({ length: 13 }, (_, i) => {
    const n = i + 1;
    return `/yachts/70azimutandiamo/70azimutandiamo${n}.png`;
  }),
];

const SEA_RAY_55_MIAMI_MISTRESS_GALLERY: readonly string[] = [
  "/yachts/55searayflymiamimistress/55searayflymiamimistress.png",
  ...Array.from({ length: 11 }, (_, i) => {
    const n = i + 1;
    return `/yachts/55searayflymiamimistress/55searayflymiamimistress${n}.png`;
  }),
];

const SEA_RAY_50_SALTY_GALLERY: readonly string[] = [
  "/yachts/50searaysalty/50searaysalty.png",
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return `/yachts/50searaysalty/50searaysalty${n}.png`;
  }),
];

const SUNSEEKER_90_MISTRIAL_GALLERY: readonly string[] = [
  "/yachts/90sunseekermistrial/90sunseekermistrial.png",
  ...Array.from({ length: 16 }, (_, i) => {
    const n = i + 1;
    return `/yachts/90sunseekermistrial/90sunseekermistrial${n}.png`;
  }),
];

/** 68′ Azimut Cerulean — mixed `.webp` / `.jpg` filenames as on disk. */
const AZIMUT_68_CERULEAN_GALLERY: readonly string[] = [
  "/yachts/68azimut/68azimut.webp",
  "/yachts/68azimut/68azimut1.webp",
  "/yachts/68azimut/68azimut2.jpg",
  "/yachts/68azimut/68azimut3.jpg",
  "/yachts/68azimut/68azimut4.jpg",
  "/yachts/68azimut/68azimut5.webp",
  "/yachts/68azimut/68azimut6.webp",
  "/yachts/68azimut/68azimut7.jpg",
  "/yachts/68azimut/68azimut8.jpg",
  "/yachts/68azimut/68azimut9.jpg",
  "/yachts/68azimut/68azimut10.jpg",
  "/yachts/68azimut/68azimut11.jpg",
];

export const YACHT_FLEET_GALLERY_PATHS: Readonly<
  Record<string, readonly string[]>
> = {
  "75-prestige-oceana": PRESTIGE_75_OCEANA_GALLERY,
  "74-sunseeker": SUNSEEKER_74_2023_GALLERY,
  "72-azimut-7s": AZIMUT_72_7S_GALLERY,
  "80-sunseeker-smu": SUNSEEKER_80_SMU_GALLERY,
  "68-galeon-2025": GALEON_68_2025_GALLERY,
  "68-galeon": GALEON_68_GALLERY,
  "65-prestige": PRESTIGE_65_GALLERY,
  "64-azimut": AZIMUT_64_GALLERY,
  "75-aicon": AICON_75_GALLERY,
  "70-azimut-days-like-this": AZIMUT_70_DAYS_LIKE_THIS_GALLERY,
  "68-azimut-the-one": AZIMUT_68_THE_ONE_GALLERY,
  "65-azimut-allegra": AZIMUT_65_ALLEGRA_GALLERY,
  "53-galeon-h": GALEON_53_H_GALLERY,
  "60-azimut-supreme-1": AZIMUT_60_SUPREME1_GALLERY,
  "60-azimut-supreme-2": AZIMUT_60_SUPREME2_GALLERY,
  "52-prestige": PRESTIGE_52_GALLERY,
  "40-fjord": FJORD_40_GALLERY,
  "48-formula": FORMULA_48_GALLERY,
  "105-azimut": AZIMUT_105_RIVER_GALLERY,
  "103-azimut": AZIMUT_103_GALLERY,
  "112-custom-privilege": CUSTOM_PRIVILEGE_112_GALLERY,
  "68-sunseeker-nassau": SUNSEEKER_68_NASSAU_GALLERY,
  "105-leopard": LEOPARD_105_GALLERY,
  "70-sunreef-supreme": SUNREEF_70_SUPREME_GALLERY,
  "100-dominator": DOMINATOR_100_GALLERY,
  "110-horizon": HORIZON_110_GALLERY,
  "56-lagoon-nassau": LAGOON_56_NASSAU_GALLERY,
  "70-azimut-2023": AZIMUT_70_2023_GALLERY,
  "80-azimut-s8": AZIMUT_80_S8_GALLERY,
  "105-aqua": AQUA_105_GALLERY,
  "66-azimut-2018": AZIMUT_66_2018_GALLERY,
  "88-azimut-sati": AZIMUT_88_SATI_GALLERY,
  "70-azimut-lupo-ii": AZIMUT_70_LUPO_II_GALLERY,
  "90-azimut-day-dreamin": AZIMUT_90_DAY_DREAMIN_GALLERY,
  "74-princess": PRINCESS_74_GALLERY,
  "84-sunseeker": SUNSEEKER_84_GALLERY,
  "80-sunseeker": SUNSEEKER_80_GALLERY,
  "70-azimut-le-grand-bleu": AZIMUT_70_LE_GRAND_BLEU_GALLERY,
  "88-sunseeker": SUNSEEKER_88_GALLERY,
  "70-azimut-211": AZIMUT_70_211_GALLERY,
  "60-azimut-freedom": AZIMUT_60_FREEDOM_GALLERY,
  "62-pershing": PERSHING_62_GALLERY,
  "70-aicon": AICON_70_GALLERY,
  "66-marquis": MARQUIS_66_GALLERY,
  "43-pardo-2021": PARDO_43_2021_GALLERY,
  "57-azimut-thales": AZIMUT_57_THALES_GALLERY,
  "55-azimut-azure": AZIMUT_55_AZURE_GALLERY,
  "38-pardo-2023": PARDO_38_2023_GALLERY,
  "52-beneteau-fly": BENETEAU_52_FLY_GALLERY,
  "48-cruiser-sport": CRUISER_48_SPORT_GALLERY,
  "44-sea-ray-sea-daze": SEA_RAY_44_SEA_DAZE_GALLERY,
  "45-sunseeker-la-pedro": SUNSEEKER_45_LA_PEDRO_GALLERY,
  "58-azimut-letz-go": AZIMUT_58_LETZ_GO_GALLERY,
  "50-searay-fly-one-love": SEA_RAY_50_ONE_LOVE_GALLERY,
  "60-ferretti-catalaya": FERRETTI_60_CATALAYA_GALLERY,
  "70-azimut-andiamo": AZIMUT_70_ANDIAMO_GALLERY,
  "55-searay-fly-miami-mistress": SEA_RAY_55_MIAMI_MISTRESS_GALLERY,
  "50-searay-salty": SEA_RAY_50_SALTY_GALLERY,
  "90-sunseeker-mistrial": SUNSEEKER_90_MISTRIAL_GALLERY,
  "68-azimut": AZIMUT_68_CERULEAN_GALLERY,
};

export function getFleetGalleryPaths(yachtId: string): readonly string[] {
  return YACHT_FLEET_GALLERY_PATHS[yachtId] ?? [];
}
