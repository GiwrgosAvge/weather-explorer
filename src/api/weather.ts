export type Point = { lat: number; lon: number };

export type CurrentWeather = {
  lat: number;
  lon: number;
  temperature: number; // °C
  weatherCode: number;
  windSpeed: number; // km/h
  isDay: boolean;
};

const TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { at: number; data: CurrentWeather }>();
const keyOf = (p: Point) => `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`;

/**
 * Current weather for many points in ONE request (Open-Meteo accepts
 * comma-separated coordinates). Points fetched in the last 15 minutes
 * come from an in-memory cache, so only missing points hit the API.
 */
export async function fetchCurrentForPoints(points: Point[], signal?: AbortSignal): Promise<CurrentWeather[]> {
  const now = Date.now();
  const missing = points.filter((p) => {
    const hit = cache.get(keyOf(p));
    return !hit || now - hit.at > TTL_MS;
  });

  if (missing.length > 0) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", missing.map((p) => p.lat).join(","));
    url.searchParams.set("longitude", missing.map((p) => p.lon).join(","));
    url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m,is_day");

    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(res.status === 429 ? "Too many requests. Wait a moment and try again." : `Weather service error (${res.status})`);
    }
    const json = await res.json();
    const results = Array.isArray(json) ? json : [json];

    results.forEach((r: any, i: number) => {
      const p = missing[i];
      cache.set(keyOf(p), {
        at: now,
        data: {
          lat: p.lat,
          lon: p.lon,
          temperature: r.current.temperature_2m,
          weatherCode: r.current.weather_code,
          windSpeed: r.current.wind_speed_10m,
          isDay: r.current.is_day === 1,
        },
      });
    });
  }

  return points.map((p) => cache.get(keyOf(p))!.data);
}

// ---------- Detailed forecast for one place ----------

export type Forecast = {
  current: {
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    weatherCode: number;
    windSpeed: number;
    isDay: boolean;
  };
  hourly: { time: string; temperature: number; weatherCode: number; precipProb: number | null; isDay: boolean }[];
  daily: {
    date: string;
    weatherCode: number;
    max: number;
    min: number;
    precipProb: number | null;
    sunrise: string;
    sunset: string;
  }[];
};

const FORECAST_PARAMS = {
  current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day",
  hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
  daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
  forecast_days: "7",
  timezone: "auto", // times come back in each place's local time
};

/** Turns one raw Open-Meteo forecast object into our Forecast shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseForecast(j: any): Forecast {
  // Local ISO strings compare correctly as text. Start the hourly list at the current hour.
  const nowHour = j.current.time.slice(0, 13) + ":00";
  let start = j.hourly.time.findIndex((t: string) => t >= nowHour);
  if (start < 0) start = 0;

  return {
    current: {
      time: j.current.time,
      temperature: j.current.temperature_2m,
      feelsLike: j.current.apparent_temperature,
      humidity: j.current.relative_humidity_2m,
      precipitation: j.current.precipitation,
      weatherCode: j.current.weather_code,
      windSpeed: j.current.wind_speed_10m,
      isDay: j.current.is_day === 1,
    },
    hourly: j.hourly.time.slice(start, start + 24).map((t: string, i: number) => ({
      time: t,
      temperature: j.hourly.temperature_2m[start + i],
      weatherCode: j.hourly.weather_code[start + i],
      precipProb: j.hourly.precipitation_probability[start + i],
      isDay: j.hourly.is_day[start + i] === 1,
    })),
    daily: j.daily.time.map((d: string, i: number) => ({
      date: d,
      weatherCode: j.daily.weather_code[i],
      max: j.daily.temperature_2m_max[i],
      min: j.daily.temperature_2m_min[i],
      precipProb: j.daily.precipitation_probability_max[i],
      sunrise: j.daily.sunrise[i],
      sunset: j.daily.sunset[i],
    })),
  };
}

/** Full forecasts for several places in ONE request (comma-separated coordinates). */
export async function fetchForecasts(points: Point[], signal?: AbortSignal): Promise<Forecast[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", points.map((p) => p.lat).join(","));
  url.searchParams.set("longitude", points.map((p) => p.lon).join(","));
  for (const [k, v] of Object.entries(FORECAST_PARAMS)) url.searchParams.set(k, v);

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(res.status === 429 ? "Too many requests. Wait a moment and try again." : `Weather service error (${res.status})`);
  }
  const json = await res.json();
  return (Array.isArray(json) ? json : [json]).map(parseForecast);
}

export async function fetchForecast(lat: number, lon: number, signal?: AbortSignal): Promise<Forecast> {
  return (await fetchForecasts([{ lat, lon }], signal))[0];
}
