# Weather Explorer

An interactive world map for exploring the weather, like a TV forecast where the viewer holds the remote. The map opens with the current temperature of cities across the view, like a TV forecast. Pan and zoom to see the weather change from place to place, rest the cursor on any spot for its exact temperature, click for a full forecast, and save places to "My world" to keep them on the map and compare them side by side.

Data comes from the [Open-Meteo](https://open-meteo.com/) Forecast and Geocoding APIs.

## 1. Installation and setup

**Prerequisites:** Node.js 18 or newer and npm.

```bash
npm install
npm run dev      # starts the dev server, usually at http://localhost:5173
```

Other scripts:

```bash
npm test         # runs the unit tests (Vitest)
npm run build    # type-checks and builds to dist/
npm run preview  # serves the production build locally
```

**Environment variables:** none. Open-Meteo, the map tiles and Nominatim need no API key.

**Windows PowerShell:** if `npm` is blocked by the execution policy, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or use `npm.cmd`, or use Command Prompt.

## 2. Implementation choices

- **React 18 + TypeScript + Vite.** Small, fast to run, and typed API responses.
- **Leaflet + react-leaflet** for the map. Light, no token, and easy to layer custom behaviour on top.
- **TanStack Query** for fetching and caching. Each location is cached by rounded coordinates, so revisiting a place costs no request.
- **Map tiles:** Esri "Dark Gray" base and reference layers (English place names worldwide), tinted navy with a CSS filter (`.map-tint` in `src/styles.css`).
- **Plain CSS** with variables, no UI library. The theme lives at the top of `src/styles.css`.
- **Hand-written SVG** for the comparison chart, so no chart library is needed.
- **Vitest** for unit tests of the pure logic in `src/lib` and the forecast parser.
- **No other runtime dependencies.** Fonts: Instrument Sans from Google Fonts.

### How the experience works

- **City temperatures:** about 300 hand-picked cities (`src/lib/cities.ts`), in three tiers. Capitals and big cities show from the world view, and smaller ones join in as you zoom. Labels never overlap each other or the place pins, and the set depends only on the zoom, so panning keeps the same cities. Click one to open its forecast.
- **Hover (desktop):** after the mouse rests about 0.5 s, the temperature of that spot is shown next to the cursor. Cells are small (5 to 50 km depending on zoom), so the reading matches the spot under the cursor and doesn't jump to a nearby mountain or the sea.
- **Click / tap:** opens the detail panel (now, next 24 hours, 7 days, sunrise and sunset) for that exact point. The place is named via reverse geocoding, and the map moves if the panel would hide the pin.
- **Search:** Open-Meteo Geocoding with debounce, caching, keyboard navigation and ARIA combobox roles.
- **My location:** uses the browser Geolocation API, only when the button is pressed. Coordinates are rounded to 2 decimals (~1 km).
- **My world:** up to 10 saved places, persisted in `localStorage`. They stay on the map as starred pins with live temperatures, and can be compared in a table plus a 24-hour temperature chart.
- **Share:** the open place is kept in the URL (`?lat=..&lon=..&name=..`). The Share button copies the link, or opens the share sheet on phones.
- **Units:** °C/°F toggle (also switches km/h to mph and mm to in), remembered in `localStorage`. Data stays in metric internally.
- **Tooltips:** buttons use a small tooltip in the app's own style instead of the browser's native title box.
- **Phones:** the detail panel becomes a bottom sheet, and the hint says "tap" instead of "hover".

### Keeping within API limits

- The city layer makes at most **one** request per settled view (400 ms after panning stops), with all new cities in a single multi-location call (at most 36). Cities already seen come from the cache (15 minutes), so panning back and forth costs nothing.
- Hover makes one request per resting spot, cached for 15 minutes.
- My world and the comparison load all saved places in **one** multi-location request, and reuse any place already cached.
- The detail panel, its map pin, My world and the comparison share one cache entry per place, so a place is never fetched twice.
- Debounced search (300 ms) and debounced reverse geocoding (350 ms), both cached.
- 429 responses show a clear message with a retry action.

## 3. Incomplete requirements

- Unit tests cover the pure logic (grid, hover cells, place names, colours, weather codes, forecast parsing). There are no component or end-to-end tests yet, and the app has been checked by hand on desktop and phone-sized screens only.
- Map-click places are named with OpenStreetMap Nominatim because Open-Meteo has no reverse geocoding. Administrative words ("Municipality of", "Region") are stripped, but some names are still regional rather than the nearest town. In open sea or remote areas the name falls back to "Remote location".
- The city layer shows current temperatures only, and only for the cities in the list: zoomed far in on a rural area there may be none, and hover or click is the way to read the weather there. There is no animated layer (clouds, rain radar, wind) and no time slider.

## 4. Next steps

- A time slider for the overview layer (hourly forecast for the next day), and a switch between temperature, rain and wind.
- Self-host or buy a tile plan for production. The free Esri and OpenStreetMap services are fine for a demo, not for heavy traffic.
- Run reverse geocoding through a small proxy with its own cache to respect Nominatim's usage policy at scale.
- Component tests (Testing Library) and an end-to-end test of search, click, save and compare.
- Choose the first map view from the user's location or language, and add more languages.

## 5. Additional notes

- Tiles: Esri, HERE, Garmin, FAO, NOAA, USGS and OpenStreetMap contributors (attribution is shown on the map).
- Weather data: Open-Meteo, free for non-commercial use. Reverse geocoding: OpenStreetMap Nominatim (about 1 request per second limit).
- Nothing personal is sent anywhere except the coordinates you look up. Saved places and the unit choice stay in your browser.
- Weather codes follow the WMO table used by Open-Meteo and are mapped to emoji icons in `src/lib/weatherCodes.ts`.
- The comparison chart's colours are a fixed categorical palette checked for colour-blind separation and contrast on the dark panel; places are also named in a legend and at the line ends, so colour is never the only cue.
