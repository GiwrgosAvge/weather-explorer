const round2 = (n: number) => Math.round(n * 100) / 100;
const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;
// Coarser cells when zoomed out, so repeated hovers land on already-cached cells.
// Kept to a few km on screen: a bigger cell can snap onto a mountain or the sea
// and show a temperature quite different from the spot under the cursor.
export const stepFor = (zoom: number) => (zoom <= 3 ? 0.5 : zoom <= 5 ? 0.2 : zoom <= 7 ? 0.1 : 0.05);

export function cellOf(h: { lat: number; lon: number; zoom: number }) {
  const step = stepFor(h.zoom);
  return {
    lat: round2(Math.max(-89, Math.min(89, Math.round(h.lat / step) * step))),
    lon: round2(wrapLon(Math.round(wrapLon(h.lon) / step) * step)),
  };
}
