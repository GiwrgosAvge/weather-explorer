import { Marker, Pane } from "react-leaflet";
import L from "leaflet";
import { useForecasts } from "../hooks/useForecasts";
import { useUnits } from "../hooks/useUnits";
import { describeWeather } from "../lib/weatherCodes";
import { tempColor } from "../lib/temperature";
import { escapeHtml } from "../lib/escapeHtml";
import type { SavedPlace } from "../lib/types";

/** The user's saved places stay on the map, so their own "picture of the world" is always visible. */
export default function SavedPins({ places, hiddenId, onOpen }: { places: SavedPlace[]; hiddenId: string | null; onOpen: (p: SavedPlace) => void }) {
  const results = useForecasts(places); // same query as My world: no extra request
  const { temp } = useUnits();

  return (
    <Pane name="saved" style={{ zIndex: 620 }}>
      {places.map((p, i) => {
        if (p.id === hiddenId) return null; // the selected place already has the big pin
        const f = results[i]?.data;
        const wx = f ? describeWeather(f.current.weatherCode, f.current.isDay) : null;
        const col = f ? tempColor(f.current.temperature) : null;
        const icon = L.divIcon({
          className: "wx-pin-wrap",
          iconSize: [0, 0],
          html: `<div class="wx-pin saved">
                   <span class="wx-pin-name">★ ${escapeHtml(p.name.split(",")[0])}</span>
                   <span class="wx-pin-temp" style="${col ? `background:${col.bg};color:${col.fg}` : ""}">${wx && f ? `${wx.icon} ${temp(f.current.temperature)}` : "…"}</span>
                 </div>`,
        });
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lon]}
            icon={icon}
            pane="saved"
            alt={p.name}
            eventHandlers={{ click: () => onOpen(p) }}
          />
        );
      })}
    </Pane>
  );
}
