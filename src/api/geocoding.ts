import { joinPlaceParts } from "../lib/placeNames";

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // region / state
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = await res.json();
  return json.results ?? []; // the API omits "results" when nothing matches
}

export function formatPlaceLabel(r: GeocodingResult): string {
  return joinPlaceParts([r.name, r.admin1, r.country]);
}
