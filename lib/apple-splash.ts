/**
 * iOS shows a launch image while the installed app starts, but only one whose pixel size
 * matches the device exactly; without a match it shows a blank white screen.
 * [CSS width, CSS height, device pixel ratio], portrait. Images live in public/splash/.
 */
// prettier-ignore
const DEVICES: [number, number, number][] = [
  [440, 956, 3], // iPhone 16/17 Pro Max
  [430, 932, 3], // iPhone 14 Pro Max, 15/16 Plus, 15 Pro Max
  [420, 912, 3], // iPhone Air
  [402, 874, 3], // iPhone 16/17 Pro, 17
  [393, 852, 3], // iPhone 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [390, 844, 3], // iPhone 12, 13, 14, 16e
  [375, 812, 3], // iPhone X, XS, 11 Pro, 12/13 mini
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [414, 896, 2], // iPhone XR, 11
  [414, 736, 3], // iPhone 6/7/8 Plus
  [375, 667, 2], // iPhone 6/7/8, SE (2nd/3rd gen)
  [320, 568, 2], // iPhone SE (1st gen)
  [1032, 1376, 2], // iPad Pro 13" (M4)
  [1024, 1366, 2], // iPad Pro 12.9"
  [834, 1210, 2], // iPad Pro 11" (M4)
  [834, 1194, 2], // iPad Pro 11"
  [820, 1180, 2], // iPad Air (4th gen+), iPad (10th gen)
  [834, 1112, 2], // iPad Air (3rd gen), iPad Pro 10.5"
  [810, 1080, 2], // iPad (7th–9th gen)
  [768, 1024, 2], // iPad mini (≤5th gen), iPad 9.7"
  [744, 1133, 2], // iPad mini (6th gen+)
];

export const appleStartupImages: { url: string; media: string }[] = DEVICES.map(
  ([width, height, ratio]) => ({
    url: `/splash/apple-splash-${width * ratio}x${height * ratio}.png`,
    media:
      `(device-width: ${width}px) and (device-height: ${height}px) and ` +
      `(-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
  }),
);
