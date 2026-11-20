import { useCallback, useEffect, useState } from "react";
import WeatherMap from "./components/WeatherMap";
import SearchBox from "./components/SearchBox";
import DetailPanel from "./components/DetailPanel";
import MyWorld from "./components/MyWorld";
import CompareView from "./components/CompareView";
import { useGeolocation } from "./hooks/useGeolocation";
import { useResolvedPlace } from "./hooks/useResolvedPlace";
import { useSavedPlaces } from "./hooks/useSavedPlaces";
import { useUnits } from "./hooks/useUnits";
import { placeId, type Place, type SavedPlace } from "./lib/types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** A shared link (?lat=..&lon=..&name=..) opens straight on that place. */
function placeFromUrl(): Place | null {
  const q = new URLSearchParams(window.location.search);
  const lat = Number(q.get("lat"));
  const lon = Number(q.get("lon"));
  if (!q.has("lat") || !q.has("lon") || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 85 || Math.abs(lon) > 180) return null;
  const name = q.get("name")?.slice(0, 120).trim();
  return { name: name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, lat: round2(lat), lon: round2(lon), kind: "search" };
}

export default function App() {
  const [selected, setSelected] = useState<Place | null>(placeFromUrl);
  const place = useResolvedPlace(selected); // same place, but with a real name
  const { locate, loading, error, clearError } = useGeolocation(setSelected);
  const saved = useSavedPlaces();
  const { units, toggle: toggleUnits } = useUnits();
  const [showWorld, setShowWorld] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const pick = useCallback((lat: number, lon: number) => {
    setSelected({ name: "", lat: round2(lat), lon: round2(lon), kind: "pick" });
  }, []);

  // Keep the open place in the URL, so it can be shared or bookmarked
  useEffect(() => {
    const url = new URL(window.location.href);
    url.search = "";
    if (place) {
      url.searchParams.set("lat", place.lat.toFixed(2));
      url.searchParams.set("lon", place.lon.toFixed(2));
      if (!place.pending) url.searchParams.set("name", place.name);
    }
    window.history.replaceState(null, "", url);
  }, [place?.lat, place?.lon, place?.name, place?.pending]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickCity = useCallback((c: { name: string; lat: number; lon: number }) => {
    setSelected({ name: c.name, lat: c.lat, lon: c.lon, kind: "city" });
  }, []);

  const canSave = !!place && !place.pending;
  const isSaved = !!place && saved.has(place.lat, place.lon);

  function toggleSave() {
    if (!place) return;
    if (isSaved) return saved.remove(placeId(place.lat, place.lon));
    const name = place.name === "Remote location" ? `${place.lat.toFixed(2)}°, ${place.lon.toFixed(2)}°` : place.name;
    saved.add({ name, lat: place.lat, lon: place.lon });
  }

  function openSaved(p: SavedPlace) {
    setSelected({ name: p.name, lat: p.lat, lon: p.lon, kind: "search" });
    if (window.matchMedia("(max-width: 700px)").matches) setShowWorld(false); // phones: make room for the detail sheet
  }

  return (
    <div className="app">
      <main className={`stage${place ? " has-panel" : ""}`}>
        <WeatherMap place={place} onPick={pick} onPickCity={pickCity} saved={saved.places} onOpenSaved={openSaved} />

        <div className="overlay">
          <div className="searchbar">
            <div className="logo">
              <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
                <circle cx="13" cy="12" r="6.5" fill="#f4b73f" />
                <path d="M9 26a5.2 5.2 0 0 1-.4-10.4A7.2 7.2 0 0 1 22.3 17 4.5 4.5 0 0 1 22 26Z" fill="#5fb0ff" />
              </svg>
              <span>Weather Explorer</span>
            </div>
            <SearchBox onSelect={setSelected} />
            <button
              className="unit-btn"
              onClick={toggleUnits}
              aria-label={`Units: ${units === "metric" ? "Celsius" : "Fahrenheit"}. Switch to ${units === "metric" ? "Fahrenheit" : "Celsius"}`}
              data-tip="Switch units"
            >
              <span className={units === "metric" ? "on" : ""}>°C</span>
              <span className={units === "imperial" ? "on" : ""}>°F</span>
            </button>
            <button
              className="round-btn world-btn"
              onClick={() => setShowWorld((v) => !v)}
              aria-expanded={showWorld}
              aria-label={`My world, ${saved.places.length} saved places`}
              data-tip="My world"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8Z" fill="currentColor" />
              </svg>
              {saved.places.length > 0 && <span className="badge">{saved.places.length}</span>}
            </button>
            <button className="round-btn locate" onClick={locate} disabled={loading} aria-label="Show weather at my location" data-tip="My location">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M3.5 11 20.5 3.5 13 20.5l-2-7.5Z" fill="#04233a" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="notice" role="alert">
              <span>{error}</span>
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}
        </div>

        {showWorld && (
          <MyWorld
            places={saved.places}
            onClose={() => setShowWorld(false)}
            onSelect={openSaved}
            onRemove={saved.remove}
            onCompare={() => setShowCompare(true)}
          />
        )}

        {place && (
          <DetailPanel
            place={place}
            onClose={() => setSelected(null)}
            saved={isSaved}
            canSave={canSave}
            isFull={saved.isFull}
            onToggleSave={toggleSave}
          />
        )}

        {showCompare && saved.places.length >= 2 && <CompareView places={saved.places} onClose={() => setShowCompare(false)} />}
      </main>
    </div>
  );
}
