import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchForecast, fetchForecasts, type Forecast } from "../api/weather";

const STALE_MS = 10 * 60 * 1000;
type LatLon = { lat: number; lon: number };

export const forecastKey = (p: LatLon) => ["forecast", p.lat.toFixed(2), p.lon.toFixed(2)];

/** Forecast for one place. The detail panel, its map pin and My world all share this cache entry. */
export function useForecast(p: LatLon) {
  return useQuery({
    queryKey: forecastKey(p),
    queryFn: ({ signal }) => fetchForecast(p.lat, p.lon, signal),
    staleTime: STALE_MS,
  });
}

/**
 * Forecasts for many places with at most ONE request: places already in the cache
 * are reused, and only the missing ones are fetched together.
 */
export function useForecasts(places: LatLon[]) {
  const qc = useQueryClient();
  const ids = places.map((p) => `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`);

  const q = useQuery({
    queryKey: ["forecasts", ...ids],
    enabled: places.length > 0,
    staleTime: STALE_MS,
    queryFn: async ({ signal }) => {
      const now = Date.now();
      const missing = places.filter((p) => {
        const s = qc.getQueryState(forecastKey(p));
        return !s?.data || now - s.dataUpdatedAt > STALE_MS;
      });
      if (missing.length > 0) {
        const res = await fetchForecasts(missing, signal);
        res.forEach((f, i) => qc.setQueryData(forecastKey(missing[i]), f));
      }
      return places.map((p) => qc.getQueryData<Forecast>(forecastKey(p))!);
    },
  });

  return places.map((p, i) => ({
    // cached places show at once, even while a newly added one is loading
    data: q.data?.[i] ?? qc.getQueryData<Forecast>(forecastKey(p)),
    isError: q.isError,
    refetch: q.refetch,
  }));
}
