import { useRef, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentForPoints } from "../api/weather";
import { describeWeather } from "../lib/weatherCodes";
import { useDebounced } from "../hooks/useDebounced";
import { useUnits } from "../hooks/useUnits";
import { cellOf } from "../lib/hoverCell";

type Hover = { x: number; y: number; lat: number; lon: number; zoom: number; w: number; h: number };

/**
 * Temperature under the cursor. Nothing is requested while the mouse is moving:
 * only after it rests ~0.5 s on a cell, and one cell = one cached request.
 */
export default function HoverReadout() {
  const [hover, setHover] = useState<Hover | null>(null);
  const { temp } = useUnits();
  const dragging = useRef(false);

  useMapEvents({
    mousemove: (e) => {
      if (dragging.current) return;
      // a city or pin already shows its own temperature: don't stack a second box on it
      if ((e.originalEvent.target as Element | null)?.closest?.(".wx-chip, .wx-pin")) return setHover(null);
      setHover({ x: e.containerPoint.x, y: e.containerPoint.y, lat: e.latlng.lat, lon: e.latlng.lng, zoom: e.target.getZoom(), w: e.target.getSize().x, h: e.target.getSize().y });
    },
    mouseout: () => setHover(null),
    dragstart: () => { dragging.current = true; setHover(null); },
    dragend: () => { dragging.current = false; },
    zoomstart: () => setHover(null),
  });

  const cell = hover ? cellOf(hover) : null;
  const key = cell ? `${cell.lat}|${cell.lon}` : null;
  const settled = useDebounced(key, 500);

  const { data, error } = useQuery({
    queryKey: ["hover", key],
    queryFn: ({ signal }) => fetchCurrentForPoints([cell!], signal).then((r) => r[0]),
    enabled: !!key && key === settled, // cached cells still show instantly; only new ones wait for the pause
    staleTime: 15 * 60 * 1000,
    retry: false,
  });

  if (!hover || (!data && !error)) return null;

  // sits below-right of the cursor (so it never covers a pin above a clicked point), flipping near the edges
  const flipUp = hover.y > hover.h - 70;
  const flipLeft = hover.x > hover.w - 200;
  const style = {
    left: flipLeft ? hover.x - 14 : hover.x + 14,
    top: flipUp ? hover.y - 46 : hover.y + 22,
    transform: flipLeft ? "translateX(-100%)" : undefined,
  };

  if (error || !data) {
    return <div className="hover-bubble" style={style}>Couldn't load the weather here</div>;
  }
  const wx = describeWeather(data.weatherCode, data.isDay);
  return (
    <div className="hover-bubble" style={style}>
      <span aria-hidden="true">{wx.icon}</span> <strong>{temp(data.temperature)}</strong> <span>{wx.label}</span>
    </div>
  );
}
