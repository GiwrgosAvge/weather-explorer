import { useEffect, useRef } from "react";
import { useForecasts } from "../hooks/useForecasts";
import { useUnits, type UnitFmt } from "../hooks/useUnits";
import type { Forecast } from "../api/weather";
import { describeWeather } from "../lib/weatherCodes";
import TempChart, { SERIES } from "./TempChart";
import type { SavedPlace } from "../lib/types";

const deg = (n: number, u: UnitFmt) => u.temp(n);

type NumRow = { label: string; get: (f: Forecast) => number | null; fmt: (n: number, u: UnitFmt) => string; mark: "temp" | "max" | "none" };

const NUM_ROWS: NumRow[] = [
  { label: "Temperature now", get: (f) => f.current.temperature, fmt: (n, u) => deg(n, u), mark: "temp" },
  { label: "Feels like", get: (f) => f.current.feelsLike, fmt: (n, u) => deg(n, u), mark: "temp" },
  { label: "Today's high", get: (f) => f.daily[0].max, fmt: (n, u) => deg(n, u), mark: "temp" },
  { label: "Today's low", get: (f) => f.daily[0].min, fmt: (n, u) => deg(n, u), mark: "temp" },
  { label: "Chance of rain today", get: (f) => f.daily[0].precipProb, fmt: (n) => `${n}%`, mark: "max" },
  { label: "Wind", get: (f) => f.current.windSpeed, fmt: (n, u) => u.wind(n), mark: "max" },
  { label: "Humidity", get: (f) => f.current.humidity, fmt: (n) => `${n}%`, mark: "none" },
];

export default function CompareView({ places, onClose }: { places: SavedPlace[]; onClose: () => void }) {
  const results = useForecasts(places);
  const u = useUnits();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  const forecasts = results.map((r) => r.data ?? null);
  const dash = <span className="cmp-na">–</span>;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cmp-title" onKeyDown={(e) => e.key === "Escape" && onClose()}>
        <div className="modal-head">
          <h2 id="cmp-title">Compare places</h2>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close comparison">✕</button>
        </div>

        <div className="modal-body">
          <table className="cmp">
            <thead>
              <tr>
                <td />
                {places.map((p, i) => (
                  <th key={p.id} scope="col">
                    {p.name}
                    {results[i]?.isError && (
                      <button className="link-btn" onClick={() => results[i].refetch()}>Try again</button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Conditions</th>
                {forecasts.map((f, i) => {
                  const wx = f ? describeWeather(f.current.weatherCode, f.current.isDay) : null;
                  return <td key={places[i].id}>{wx ? <><span aria-hidden="true">{wx.icon}</span> {wx.label}</> : results[i]?.isError ? "Couldn't load" : "Loading…"}</td>;
                })}
              </tr>
              <tr>
                <th scope="row">Local time</th>
                {forecasts.map((f, i) => <td key={places[i].id}>{f ? f.current.time.slice(11, 16) : dash}</td>)}
              </tr>

              {NUM_ROWS.map((row) => {
                const vals = forecasts.map((f) => (f ? row.get(f) : null));
                const nums = vals.filter((v): v is number => typeof v === "number");
                const max = nums.length ? Math.max(...nums) : 0;
                const min = nums.length ? Math.min(...nums) : 0;
                const spread = nums.length >= 2 && max > min;
                return (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {vals.map((v, i) => {
                      let cls = "";
                      if (v !== null && spread) {
                        if (row.mark === "temp") cls = v === max ? "hot" : v === min ? "cold" : "";
                        if (row.mark === "max" && v === max && max > 0) cls = "peak";
                      }
                      return <td key={places[i].id} className={cls}>{v === null ? dash : row.fmt(v, u)}</td>;
                    })}
                  </tr>
                );
              })}

              <tr>
                <th scope="row">Week range</th>
                {forecasts.map((f, i) => (
                  <td key={places[i].id}>
                    {f ? `${u.temp(Math.min(...f.daily.map((d) => d.min)))} to ${u.temp(Math.max(...f.daily.map((d) => d.max)))}` : dash}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Sunrise</th>
                {forecasts.map((f, i) => <td key={places[i].id}>{f ? f.daily[0].sunrise.slice(11, 16) : dash}</td>)}
              </tr>
              <tr>
                <th scope="row">Sunset</th>
                {forecasts.map((f, i) => <td key={places[i].id}>{f ? f.daily[0].sunset.slice(11, 16) : dash}</td>)}
              </tr>
            </tbody>
          </table>
          <TempChart names={places.map((p) => p.name)} forecasts={forecasts} u={u} />
          {places.length > SERIES.length && (
            <p className="cmp-key">The chart shows the first {SERIES.length} places; the table shows all of them.</p>
          )}
          <p className="cmp-key">Warmest is tinted orange, coolest blue. The highest chance of rain and strongest wind are tinted grey-blue. Times are local to each place.</p>
        </div>
      </div>
    </div>
  );
}
