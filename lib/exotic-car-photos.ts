/**
 * Car photography in `public/photography/carphotos/`.
 * Used on the exotic cars catalog page and the photo/video add-on strip.
 */

const base = "/photography/carphotos";

export const CAR_PHOTO_PATHS = [
  `${base}/carphoto1.jpg`,
  `${base}/carphoto2.jpg`,
  `${base}/carphoto3.jpg`,
  `${base}/carphoto4.jpg`,
  `${base}/carphoto5.jpg`,
  `${base}/carphoto6.jpg`,
  `${base}/carphoto7.jpg`,
  `${base}/carphoto8.jpg`,
  `${base}/carphoto9.jpg`,
  `${base}/carphoto10.jpg`,
  `${base}/carphoto11.jpg`,
  `${base}/carphoto12.jpg`,
  `${base}/carphoto13.jpg`,
  `${base}/carphoto14.jpg`,
  `${base}/carphoto15.jpg`,
  `${base}/carphoto16.jpg`,
  `${base}/carphoto17.jpg`,
  `${base}/carphoto18.png`,
  `${base}/carphoto19.png`,
  `${base}/carphoto20.png`,
  `${base}/carphoto21.png`,
] as const;

/**
 * All carphotos for the “Add photo or video shoots” marquee — order is shuffled on the client (exotic cars page).
 */
export const EXOTIC_PHOTOGRAPHY_ADDON_IMAGES = CAR_PHOTO_PATHS.map(
  (src, i) => ({
    src,
    alt: `Car photography sample ${i + 1}`,
  }),
);
