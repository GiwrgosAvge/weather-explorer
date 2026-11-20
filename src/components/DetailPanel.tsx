import { useState } from "react";
import { useForecast } from "../hooks/useForecasts";
import { useUnits } from "../hooks/useUnits";
import { describeWeather } from "../lib/weatherCodes";
import { tempColor } from "../lib/temperature";
import type { Place } from "../lib/types";


function dayLabel(date: string, i: number) {
  if (i === 0) return "Today";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en", { weekday: "short" });
}

type PanelProps = {
  place: Place;
  onClose: () => void;
  saved: boolean;
  canSave: boolean; // false while the place name is still being looked up
  isFull: boolean;
  onToggleSave: () => void;
};

export default function DetailPanel({ place, onClose, saved, canSave, isFull, onToggleSave }: PanelProps) {
  const { temp: t, wind, rain } = useUnits();
  const { data, isLoading, error, refetch } = useForecast(place);
  const [shared, setShared] = useState(false);

  async function share() {
    const url = window.location.href; // App keeps the selected place in the URL
    try {
      if (navigator.share && window.matchMedia("(hover: none)").matches) {
        await navigator.share({ title: `Weather in ${place.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* share sheet closed or clipboard blocked: nothing to do */
    }
  }

  const weekMin = data ? Math.min(...data.daily.map((d) => d.min)) : 0;
  const weekMax = data ? Math.max(...data.daily.map((d) => d.max)) : 1;
  const span = Math.max(weekMax - weekMin, 1);
  const cur = data ? describeWeather(data.current.weatherCode, data.current.isDay) : null;

  return (
    <aside className="panel" aria-label={`Weather in ${place.name}`} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="panel-head">
        <div>
          <h2>{place.name}</h2>
          <p>{place.kind === "device" ? "Your location · " : ""}{place.lat.toFixed(2)}°, {place.lon.toFixed(2)}°</p>
        </div>
        <div className="panel-actions">
          <button className="save-btn" onClick={share} aria-live="polite" data-tip="Copy a link to this place">
            {shared ? "Copied" : "Share"}
          </button>
          <button
            className={`save-btn${saved ? " on" : ""}`}
            onClick={onToggleSave}
            disabled={!canSave || (!saved && isFull)}
            aria-pressed={saved}
            data-tip={!saved && isFull ? "My world is full. Remove a place first." : undefined}
          >
            {saved ? "★ Saved" : "☆ Save"}
          </button>
          <button className="icon-btn" onClick={onClose} aria-label="Close details">✕</button>
        </div>
      </div>

      {isLoading && <p className="panel-note">Loading forecast…</p>}

      {error && (
        <div className="panel-note" role="alert">
          <p>{(error as Error).message}</p>
          <button className="link-btn" onClick={() => refetch()}>Try again</button>
        </div>
      )}

      {data && cur && (
        <div className="panel-body">
          <section className="now">
            <div className="now-main">
              <span className="now-icon" aria-hidden="true">{cur.icon}</span>
              <div>
                <div className="now-temp">{t(data.current.temperature)}</div>
                <div className="now-label">{cur.label}</div>
              </div>
            </div>
            <dl className="facts">
              <div><dt>Feels like</dt><dd>{t(data.current.feelsLike)}</dd></div>
              <div><dt>Humidity</dt><dd>{data.current.humidity}%</dd></div>
              <div><dt>Wind</dt><dd>{wind(data.current.windSpeed)}</dd></div>
              <div><dt>Rain now</dt><dd>{rain(data.current.precipitation)}</dd></div>
            </dl>
          </section>

          <section>
            <h3>Next 24 hours</h3>
            <ol className="hours">
              {data.hourly.map((h, i) => {
                const w = describeWeather(h.weatherCode, h.isDay);
                return (
                  <li key={h.time}>
                    <span className="h-time">{i === 0 ? "Now" : h.time.slice(11, 16)}</span>
                    <span role="img" aria-label={w.label}>{w.icon}</span>
                    <span className="h-temp">{t(h.temperature)}</span>
                    <span className="h-rain">{h.precipProb ? `${h.precipProb}%` : ""}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <h3>Next 7 days</h3>
            <ul className="days">
              {data.daily.map((d, i) => {
                const w = describeWeather(d.weatherCode);
                return (
                  <li key={d.date}>
                    <span className="d-name">{dayLabel(d.date, i)}</span>
                    <span role="img" aria-label={w.label} data-tip={w.label} className="tip-right">{w.icon}</span>
                    <span className="d-rain">{d.precipProb ? `${d.precipProb}%` : ""}</span>
                    <span className="d-min">{t(d.min)}</span>
                    <span className="d-bar" aria-hidden="true">
                      <span
                        style={{
                          left: `${((d.min - weekMin) / span) * 100}%`,
                          width: `${Math.max(((d.max - d.min) / span) * 100, 4)}%`,
                          background: `linear-gradient(90deg, ${tempColor(d.min).bg}, ${tempColor(d.max).bg})`,
                        }}
                      />
                    </span>
                    <span className="d-max">{t(d.max)}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="sun">
            <span>Sunrise {data.daily[0].sunrise.slice(11, 16)}</span>
            <span>Sunset {data.daily[0].sunset.slice(11, 16)}</span>
          </section>
        </div>
      )}
    </aside>
  );
}
