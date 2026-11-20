import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reverseGeocode } from "../api/reverseGeocode";
import type { Place } from "../lib/types";

/** Gives map-clicked and device places a real name (e.g. "Lyon, Auvergne-Rhône-Alpes, France"). */
export function useResolvedPlace(place: Place | null): Place | null {
  const needsName = !!place && (place.kind === "pick" || place.kind === "device");
  const key = needsName ? `${place!.lat.toFixed(2)},${place!.lon.toFixed(2)}` : null;

  // wait 350 ms after the last click before asking Nominatim
  const [settledKey, setSettledKey] = useState<string | null>(null);
  useEffect(() => {
    if (!key) { setSettledKey(null); return; }
    const id = setTimeout(() => setSettledKey(key), 350);
    return () => clearTimeout(id);
  }, [key]);

  const active = key !== null && key === settledKey;
  const { data, isLoading } = useQuery({
    queryKey: ["reverse", settledKey],
    queryFn: ({ signal }) => {
      const [lat, lon] = settledKey!.split(",").map(Number);
      return reverseGeocode(lat, lon, signal);
    },
    enabled: active,
    staleTime: Infinity,
    retry: false,
  });

  if (!place) return null;
  if (!needsName) return place;
  const pending = !active || isLoading;
  const name = active && data ? data : pending ? "Finding place…" : place.kind === "device" ? "Your location" : "Remote location";
  return { ...place, name, pending };
}
