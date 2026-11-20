import { useCallback, useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Pane, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Place, SavedPlace } from "../lib/types";
import PlaceMarker from "./PlaceMarker";
import HoverReadout from "./HoverReadout";
import CityTemps, { type LayerStatus } from "./CityTemps";
import type { City } from "../lib/cities";
import SavedPins from "./SavedPins";

const WORLD = L.latLngBounds([-85, -180], [85, 180]);
const PHONE = 700; // matches the CSS breakpoint where the panel becomes a bottom sheet
const PANEL_W = 380;
const SHEET = 0.62; // share of the screen the bottom sheet covers
const TOP_BAR = 80;

// Zoomed-out limit = the world exactly filling the window, so it never repeats sideways
function FitWorld() {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const z = map.getBoundsZoom(WORLD, true);
      map.setMinZoom(z);
      if (map.getZoom() < z) map.setZoom(z);
    };
    update();
    map.on("resize", update);
    return () => { map.off("resize", update); };
  }, [map]);
  return null;
}

/** Pixel offset from the map centre to the centre of the part the detail panel leaves uncovered. */
function visibleCentreOffset(size: L.Point): L.Point {
  if (size.x <= PHONE) return L.point(0, (TOP_BAR + size.y * (1 - SHEET)) / 2 - size.y / 2);
  return L.point(-PANEL_W / 2, 0);
}

// Search / my location / shared link: fly there. Map click: only nudge the map if the
// detail panel would hide the pin.
function FollowPlace({ place }: { place: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (!place) return;
    const ll = L.latLng(place.lat, place.lon);
    const size = map.getSize();
    if (place.kind === "search" || place.kind === "device") {
      const z = place.kind === "device" ? 10 : 9;
      const centre = map.unproject(map.project(ll, z).subtract(visibleCentreOffset(size)), z);
      map.flyTo(centre, z, { duration: 1.2 });
    } else {
      // keep the pin (and its centred name label, ~260 px wide) clear of the panel and top bar
      const phone = size.x <= PHONE;
      const p = map.latLngToContainerPoint(ll);
      const minX = Math.min(140, size.x / 2);
      const maxX = phone ? size.x - minX : size.x - PANEL_W - 140;
      const minY = TOP_BAR + 60;
      const maxY = phone ? size.y * (1 - SHEET) - 16 : size.y - 40;
      const dx = p.x > maxX ? p.x - maxX : p.x < minX ? p.x - minX : 0;
      const dy = p.y > maxY ? p.y - maxY : p.y < minY ? p.y - minY : 0;
      if (dx || dy) map.panBy([dx, dy]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.lat, place?.lon, place?.kind, map]);
  return null;
}

// Leaflet's own controls use the browser's native title box; give them the app's tooltip instead
function ThemedControlTips() {
  const map = useMap();
  useEffect(() => {
    map.getContainer().querySelectorAll<HTMLElement>(".leaflet-control [title]").forEach((el) => {
      const tip = el.getAttribute("title");
      el.removeAttribute("title");
      if (el.closest(".leaflet-control-zoom") && tip) {
        el.dataset.tip = tip;
        el.classList.add("tip-right");
      }
    });
  }, [map]);
  return null;
}

// Clicking the map picks that exact point
function ClickPicker({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";

type Props = {
  place: Place | null;
  onPick: (lat: number, lon: number) => void;
  onPickCity: (c: City) => void;
  saved: SavedPlace[];
  onOpenSaved: (p: SavedPlace) => void;
};

export default function WeatherMap({ place, onPick, onPickCity, saved, onOpenSaved }: Props) {
  const [grid, setGrid] = useState<LayerStatus>({ state: "loading", retry: () => {} });
  const onGridStatus = useCallback((s: LayerStatus) => setGrid(s), []);
  const touch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const selectedId = place ? `${place.lat.toFixed(2)},${place.lon.toFixed(2)}` : null;

  return (
    <div className="map-shell">
      <MapContainer
        center={[38, 24]}
        zoom={5}
        minZoom={2}
        zoomSnap={0.25}
        maxBounds={WORLD}
        maxBoundsViscosity={1}
        worldCopyJump={false}
        className="map"
      >
        {/* Esri dark-gray basemap, tinted navy in CSS (.map-tint) */}
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors | Weather: Open-Meteo"
          url={`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
          maxNativeZoom={16}
          maxZoom={18}
          noWrap
          className="map-tint"
        />
        {/* Esri place names, shown as Esri designs them */}
        <Pane name="labels" style={{ zIndex: 250, pointerEvents: "none" }}>
          <TileLayer
            url={`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`}
            maxNativeZoom={16}
            maxZoom={18}
            noWrap
            className="map-tint"
          />
        </Pane>

        <FitWorld />
        <ThemedControlTips />
        <FollowPlace place={place} />
        <ClickPicker onPick={onPick} />
        <CityTemps onSelect={onPickCity} onStatus={onGridStatus} pins={place ? [...saved, place] : saved} />
        <SavedPins places={saved} hiddenId={selectedId} onOpen={onOpenSaved} />
        {place && <PlaceMarker place={place} />}
        {!touch && <HoverReadout />}
      </MapContainer>

      <div className="status" role="status" aria-live="polite">
        {grid.state === "error" ? (
          <>
            <span>Couldn't load the weather for this view.</span>
            <button className="link-btn" onClick={grid.retry}>Try again</button>
          </>
        ) : grid.state === "loading" ? (
          <span>Updating weather…</span>
        ) : touch ? (
          <span>Tap anywhere for the full forecast</span>
        ) : (
          <span>Hover for the temperature, click for details</span>
        )}
      </div>
    </div>
  );
}
