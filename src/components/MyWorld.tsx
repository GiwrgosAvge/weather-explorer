import { useForecasts } from "../hooks/useForecasts";
import { useUnits } from "../hooks/useUnits";
import { MAX_SAVED } from "../hooks/useSavedPlaces";
import { describeWeather } from "../lib/weatherCodes";
import { tempColor } from "../lib/temperature";
import type { SavedPlace } from "../lib/types";


type Props = {
  places: SavedPlace[];
  onClose: () => void;
  onSelect: (p: SavedPlace) => void;
  onRemove: (id: string) => void;
  onCompare: () => void;
};

export default function MyWorld({ places, onClose, onSelect, onRemove, onCompare }: Props) {
  const results = useForecasts(places);
  const { temp: deg } = useUnits();

  return (
    <aside className="world" aria-label="My world" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="world-head">
        <div>
          <h2>My world</h2>
          <p>{places.length} of {MAX_SAVED} places saved</p>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close My world">✕</button>
      </div>

      {places.length === 0 ? (
        <p className="world-empty">
          Nothing saved yet. Click anywhere on the map, or search for a place, then press Save to add it here.
        </p>
      ) : (
        <>
          <ul className="world-list">
            {places.map((p, i) => {
              const q = results[i];
              const f = q?.data;
              const wx = f ? describeWeather(f.current.weatherCode, f.current.isDay) : null;
              const col = f ? tempColor(f.current.temperature) : null;
              return (
                <li key={p.id} className="world-item">
                  <button className="world-open" onClick={() => onSelect(p)}>
                    <span className="world-text">
                      <span className="world-name">{p.name}</span>
                      <span className="world-meta">
                        {f && wx
                          ? `${wx.label}, high ${deg(f.daily[0].max)}, low ${deg(f.daily[0].min)}`
                          : q?.isError
                          ? "Couldn't load the weather"
                          : "Loading…"}
                      </span>
                    </span>
                    <span className="world-temp" style={col ? { background: col.bg, color: col.fg } : undefined}>
                      {f && wx ? `${wx.icon} ${deg(f.current.temperature)}` : "…"}
                    </span>
                  </button>
                  <button className="icon-btn" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`}>✕</button>
                </li>
              );
            })}
          </ul>
          <button className="compare-btn" onClick={onCompare} disabled={places.length < 2}>
            {places.length < 2 ? "Save one more place to compare" : "Compare side by side"}
          </button>
        </>
      )}
    </aside>
  );
}
