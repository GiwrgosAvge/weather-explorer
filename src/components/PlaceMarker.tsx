import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { useForecast } from "../hooks/useForecasts";
import { useUnits } from "../hooks/useUnits";
import { describeWeather } from "../lib/weatherCodes";
import { tempColor } from "../lib/temperature";
import { escapeHtml } from "../lib/escapeHtml";
import type { Place } from "../lib/types";

export default function PlaceMarker({ place }: { place: Place }) {
  const { temp, units } = useUnits();
  // Same cache entry as the detail panel, so the pin costs no extra request
  const { data } = useForecast(place);

  const icon = useMemo(() => {
    const w = data?.current;
    const wx = w ? describeWeather(w.weatherCode, w.isDay) : null;
    const col = w ? tempColor(w.temperature) : null;
    const title = escapeHtml(place.name.split(",")[0]);
    return L.divIcon({
      className: "wx-pin-wrap",
      iconSize: [0, 0],
      html: `<div class="wx-pin">
               <span class="wx-pin-name">${title}</span>
               <span class="wx-pin-temp" style="${col ? `background:${col.bg};color:${col.fg}` : ""}">
                 ${wx && w ? `${wx.icon} ${temp(w.temperature)}` : "…"}
               </span>
             </div>`,
    });
  }, [data, place, units]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Marker position={[place.lat, place.lon]} icon={icon} zIndexOffset={1000} interactive={false} />;
}
