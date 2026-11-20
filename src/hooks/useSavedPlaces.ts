import { useCallback, useEffect, useState } from "react";
import { placeId, type SavedPlace } from "../lib/types";

const KEY = "weather-explorer:saved:v1";
export const MAX_SAVED = 10;

function load(): SavedPlace[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p) => p && typeof p.name === "string" && Number.isFinite(p.lat) && Number.isFinite(p.lon))
      .slice(0, MAX_SAVED)
      .map((p) => ({ id: placeId(p.lat, p.lon), name: p.name, lat: p.lat, lon: p.lon }));
  } catch {
    return []; // storage blocked or corrupted: start empty
  }
}

export function useSavedPlaces() {
  const [places, setPlaces] = useState<SavedPlace[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(places));
    } catch {
      /* private mode / quota: the list just won't persist */
    }
  }, [places]);

  const has = useCallback((lat: number, lon: number) => places.some((p) => p.id === placeId(lat, lon)), [places]);
  const add = useCallback((p: Omit<SavedPlace, "id">) => {
    setPlaces((cur) => {
      const id = placeId(p.lat, p.lon);
      return cur.length >= MAX_SAVED || cur.some((x) => x.id === id) ? cur : [...cur, { ...p, id }];
    });
  }, []);
  const remove = useCallback((id: string) => setPlaces((cur) => cur.filter((p) => p.id !== id)), []);

  return { places, has, add, remove, isFull: places.length >= MAX_SAVED };
}
