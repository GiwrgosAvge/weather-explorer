import { cleanAdminName, joinPlaceParts } from "../lib/placeNames";

// Open-Meteo has no reverse geocoding, so map clicks are named via OpenStreetMap Nominatim.
// Free, but limited to ~1 request/second, so callers debounce and cache.
export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
  const json = await res.json();
  if (json.error || !json.address) return null; // open sea, poles, etc.

  const a = json.address;
  const raw = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || a.state || a.country;
  const local = raw ? cleanAdminName(raw) : null;
  const region = a.state ? cleanAdminName(a.state) : null;
  return joinPlaceParts([local, region, a.country]) || null;
}
