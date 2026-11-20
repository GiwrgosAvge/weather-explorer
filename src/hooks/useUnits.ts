import { useSyncExternalStore } from "react";

export type Units = "metric" | "imperial";
const KEY = "weather-explorer:units:v1";

function read(): Units {
  try {
    return localStorage.getItem(KEY) === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

// Tiny shared store: every component sees the same unit choice, no provider needed.
let current: Units = read();
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export function toggleUnits() {
  current = current === "metric" ? "imperial" : "metric";
  try { localStorage.setItem(KEY, current); } catch { /* not persisted */ }
  listeners.forEach((l) => l());
}

/** All API data stays in °C, km/h and mm. Conversion happens only when displaying. */
export function useUnits() {
  const units = useSyncExternalStore(subscribe, () => current);
  const imp = units === "imperial";
  return {
    units,
    toggle: toggleUnits,
    temp: (c: number) => `${Math.round(imp ? (c * 9) / 5 + 32 : c)}°`,
    wind: (kmh: number) => (imp ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`),
    rain: (mm: number) => (imp ? `${(mm / 25.4).toFixed(2)} in` : `${mm} mm`),
  };
}
export type UnitFmt = ReturnType<typeof useUnits>;
