// Colour scale for temperature in °C, like the bands on a TV weather map.
const STOPS: [number, [number, number, number]][] = [
  [-25, [92, 74, 168]],
  [-10, [64, 120, 200]],
  [0, [96, 176, 220]],
  [10, [120, 200, 160]],
  [18, [244, 216, 96]],
  [26, [244, 160, 72]],
  [34, [228, 92, 64]],
  [42, [168, 40, 60]],
];

export function tempColor(t: number): { bg: string; fg: string } {
  const c = Math.max(STOPS[0][0], Math.min(STOPS[STOPS.length - 1][0], t));
  let rgb: [number, number, number] = STOPS[STOPS.length - 1][1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i];
    const [t1, c1] = STOPS[i + 1];
    if (c >= t0 && c <= t1) {
      const k = (c - t0) / (t1 - t0);
      rgb = [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k)) as [number, number, number];
      break;
    }
  }
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return { bg: `rgb(${rgb.join(",")})`, fg: lum > 0.6 ? "#1b2430" : "#ffffff" };
}
