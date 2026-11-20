import { useEffect, useMemo, useState } from "react";
import { Marker, Pane, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentForPoints } from "../api/weather";
import { CITIES, pickCities, type City, type ScreenBox } from "../lib/cities";
import { describeWeather } from "../lib/weatherCodes";
import { tempColor } from "../lib/temperature";
import { escapeHtml } from "../lib/escapeHtml";
import { useDebounced } from "../hooks/useDebounced";
import { useUnits } from "../hooks/useUnits";

export type LayerStatus = { state: "loading" | "error" | "ok"; retry: () => void };

// Smaller cities join in as the map zooms in
const TIER_MIN_ZOOM = { 1: 0, 2: 3.5, 3: 5 } as const;
const MAX_IN_VIEW = 36;

type Props = {
  onSelect: (c: City) => void;
  onStatus: (s: LayerStatus) => void;
  pins: { lat: number; lon: number }[]; // selected and saved places: cities make room for their pins
};

/**
 * The "TV forecast" layer: current temperature for real cities across the view.
 * Which cities show depends only on the zoom (positions are measured in world pixels),
 * so panning keeps the same cities and their temperatures come from the cache.
 * New cities in view are fetched together in ONE request.
 */
export default function CityTemps({ onSelect, onStatus, pins }: Props) {
  const map = useMap();
  const [view, setView] = useState(() => ({ zoom: map.getZoom(), bounds: map.getBounds() }));
  useMapEvents({ moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }) });
  const settled = useDebounced(view, 400);

  const pinsKey = pins.map((p) => `${p.lat},${p.lon}`).join(";");

  // Collision-free set for this zoom level, independent of panning
  const zoomSet = useMemo(() => {
    const z = settled.zoom;
    const eligible = CITIES.filter((c) => z >= TIER_MIN_ZOOM[c.tier]);
    // a pin sits above its point, roughly 170×40 px
    const reserved: ScreenBox[] = pins.map((p) => {
      const pt = map.project([p.lat, p.lon], z);
      return { x1: pt.x - 85, y1: pt.y - 44, x2: pt.x + 85, y2: pt.y + 4 };
    });
    return pickCities(eligible, (c) => map.project([c.lat, c.lon], z), Infinity, reserved);
  }, [settled.zoom, map, pinsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const cities = useMemo(
    () => zoomSet.filter((c) => settled.bounds.pad(0.05).contains([c.lat, c.lon])).slice(0, MAX_IN_VIEW),
    [zoomSet, settled.bounds]
  );
  const key = cities.map((c) => c.name).join("|");

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["cities", key],
    queryFn: ({ signal }) => fetchCurrentForPoints(cities.map((c) => ({ lat: c.lat, lon: c.lon })), signal),
    enabled: cities.length > 0,
    placeholderData: (prev) => prev,
    staleTime: 15 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    onStatus({ state: isError ? "error" : isFetching ? "loading" : "ok", retry: () => void refetch() });
  }, [isError, isFetching, refetch, onStatus]);

  const { temp, units } = useUnits();
  const markers = useMemo(() => {
    // placeholder data may belong to the previous set of cities, so match by position
    const byPos = new Map((data ?? []).map((w) => [`${w.lat},${w.lon}`, w]));
    return cities.flatMap((c) => {
      const w = byPos.get(`${c.lat},${c.lon}`);
      if (!w) return [];
      const { icon } = describeWeather(w.weatherCode, w.isDay);
      const { bg, fg } = tempColor(w.temperature);
      return [{
        c,
        icon: L.divIcon({
          className: "wx-chip-wrap",
          iconSize: [0, 0],
          html: `<div class="wx-chip"><span class="wx-chip-name">${escapeHtml(c.name)}</span><span class="wx-chip-temp" style="background:${bg};color:${fg}">${icon} ${temp(w.temperature)}</span></div>`,
        }),
      }];
    });
  }, [data, cities, units]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Pane name="cities" style={{ zIndex: 450 }}>
      {markers.map(({ c, icon }) => (
        <Marker
          key={c.name}
          position={[c.lat, c.lon]}
          icon={icon}
          pane="cities"
          keyboard={false}
          eventHandlers={{ click: () => onSelect(c) }}
        />
      ))}
    </Pane>
  );
}
