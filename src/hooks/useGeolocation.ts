import { useCallback, useState } from "react";
import type { Place } from "../lib/types";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function useGeolocation(onFound: (p: Place) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location. Search for a place instead.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        // 2 decimals (~1 km) is plenty for weather and keeps cache keys stable
        onFound({ name: "Your location", lat: round2(pos.coords.latitude), lon: round2(pos.coords.longitude), kind: "device" });
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location is blocked. Allow it in your browser's site settings, or search for a place."
            : err.code === err.TIMEOUT
            ? "Finding your location took too long. Try again or search for a place."
            : "We couldn't determine your position. Search for a place instead."
        );
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [onFound]);

  return { locate, loading, error, clearError: () => setError(null) };
}
