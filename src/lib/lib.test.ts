import { describe, expect, it } from "vitest";
import { CITIES, pickCities } from "./cities";
import { cellOf } from "./hoverCell";
import { cleanAdminName, joinPlaceParts } from "./placeNames";
import { tempColor } from "./temperature";
import { describeWeather } from "./weatherCodes";
import { escapeHtml } from "./escapeHtml";
import { parseForecast } from "../api/weather";

describe("cities", () => {
  it("has valid, unique entries", () => {
    const names = new Set<string>();
    for (const c of CITIES) {
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(85);
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180);
      expect(names.has(c.name)).toBe(false);
      names.add(c.name);
    }
  });

  it("keeps labels apart and prefers the more important city", () => {
    const pair = [
      { name: "Big", lat: 0, lon: 0, tier: 1 as const },
      { name: "Near", lat: 0, lon: 0, tier: 2 as const },
      { name: "Far", lat: 0, lon: 0, tier: 2 as const },
    ];
    const pos: Record<string, { x: number; y: number }> = { Big: { x: 100, y: 100 }, Near: { x: 120, y: 105 }, Far: { x: 400, y: 100 } };
    expect(pickCities(pair, (c) => pos[c.name], 10).map((c) => c.name)).toEqual(["Big", "Far"]);
    expect(pickCities(pair, (c) => pos[c.name], 1).map((c) => c.name)).toEqual(["Big"]);
  });
});

describe("cellOf", () => {
  it("uses small cells so the reading stays close to the cursor", () => {
    const c = cellOf({ lat: 37.98, lon: 23.73, zoom: 5 });
    expect(Math.abs(c.lat - 37.98)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(c.lon - 23.73)).toBeLessThanOrEqual(0.1);
  });

  it("wraps longitude and clamps latitude", () => {
    expect(cellOf({ lat: 95, lon: 200, zoom: 2 })).toEqual({ lat: 89, lon: -160 });
  });
});

describe("place names", () => {
  it("drops administrative words", () => {
    expect(cleanAdminName("Municipality of Ilion")).toBe("Ilion");
    expect(cleanAdminName("Municipal Unit of Sikyona")).toBe("Sikyona");
    expect(cleanAdminName("Peloponnese Region")).toBe("Peloponnese");
    expect(cleanAdminName("Sulaymaniyah Governorate")).toBe("Sulaymaniyah");
    expect(cleanAdminName("Lyon")).toBe("Lyon");
  });

  it("removes repeated and empty parts", () => {
    expect(joinPlaceParts(["Tokyo", "Tokyo", "Japan"])).toBe("Tokyo, Japan");
    expect(joinPlaceParts(["Monaco", null, "monaco", ""])).toBe("Monaco");
  });
});

describe("tempColor", () => {
  it("is cool for cold and warm for hot, with readable text", () => {
    const cold = tempColor(-15);
    const hot = tempColor(38);
    const [cr, , cb] = cold.bg.match(/\d+/g)!.map(Number);
    const [hr, , hb] = hot.bg.match(/\d+/g)!.map(Number);
    expect(cb).toBeGreaterThan(cr);
    expect(hr).toBeGreaterThan(hb);
    expect(hot.fg).toBe("#ffffff");
  });

  it("clamps values outside the scale", () => {
    expect(tempColor(-80)).toEqual(tempColor(-25));
    expect(tempColor(70)).toEqual(tempColor(42));
  });
});

describe("describeWeather", () => {
  it("maps WMO codes and day/night", () => {
    expect(describeWeather(0, true).label).toBe("Clear sky");
    expect(describeWeather(0, false).icon).toBe("🌙");
    expect(describeWeather(63).label).toBe("Rain");
    expect(describeWeather(999).label).toBe("Thunderstorm");
    expect(describeWeather(20).label).toBe("Unknown");
  });
});

describe("escapeHtml", () => {
  it("escapes markup in place names before they go into map pins", () => {
    expect(escapeHtml(`<img src=x onerror="a">`)).toBe("&lt;img src=x onerror=&quot;a&quot;&gt;");
  });
});

describe("parseForecast", () => {
  it("starts the hourly list at the current local hour", () => {
    const hours = Array.from({ length: 48 }, (_, i) => `2026-11-20T${String(i % 24).padStart(2, "0")}:00`).map((t, i) =>
      i >= 24 ? t.replace("20T", "21T") : t
    );
    const raw = {
      current: { time: "2026-11-20T15:15", temperature_2m: 20, apparent_temperature: 19, relative_humidity_2m: 50, precipitation: 0, weather_code: 1, wind_speed_10m: 10, is_day: 1 },
      hourly: {
        time: hours,
        temperature_2m: hours.map((_, i) => i),
        weather_code: hours.map(() => 0),
        precipitation_probability: hours.map(() => 0),
        is_day: hours.map(() => 1),
      },
      daily: {
        time: ["2026-11-20"],
        weather_code: [1],
        temperature_2m_max: [22],
        temperature_2m_min: [12],
        precipitation_probability_max: [5],
        sunrise: ["2026-11-20T07:10"],
        sunset: ["2026-11-20T17:10"],
      },
    };
    const f = parseForecast(raw);
    expect(f.hourly).toHaveLength(24);
    expect(f.hourly[0].time).toBe("2026-11-20T15:00");
    expect(f.hourly[0].temperature).toBe(15);
    expect(f.current.isDay).toBe(true);
    expect(f.daily[0].max).toBe(22);
  });
});
