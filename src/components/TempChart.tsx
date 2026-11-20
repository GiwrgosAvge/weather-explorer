import { useState } from "react";
import type { Forecast } from "../api/weather";
import type { UnitFmt } from "../hooks/useUnits";

// Categorical palette (dark steps), fixed order, validated against the panel surface #0d192c.
export const SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#0ca30c", "#9085e9", "#e66767"];

const W = 900;
const H = 230;
const PAD = { l: 40, r: 110, t: 12, b: 26 };
const HOURS = 24;

type Series = { name: string; color: string; temps: number[] };

/** Next 24 hours of temperature for each place, aligned by hours from now. */
export default function TempChart({ names, forecasts, u }: { names: string[]; forecasts: (Forecast | null)[]; u: UnitFmt }) {
  const [hover, setHover] = useState<number | null>(null);
  const toUnit = (c: number) => (u.units === "imperial" ? (c * 9) / 5 + 32 : c);

  // Colour follows the place's position in My world, so it never changes when another place loads
  const series: Series[] = names
    .map((name, i) => ({ name: name.split(",")[0], color: SERIES[i], f: forecasts[i] }))
    .filter((s): s is { name: string; color: string; f: Forecast } => !!s.f && !!s.color)
    .map((s) => ({ name: s.name, color: s.color, temps: s.f.hourly.slice(0, HOURS).map((h) => toUnit(h.temperature)) }));

  if (series.length === 0) return null;

  const all = series.flatMap((s) => s.temps);
  const lo = Math.floor(Math.min(...all) / 5) * 5;
  const hi = Math.ceil(Math.max(...all) / 5) * 5 || lo + 5;
  const x = (i: number) => PAD.l + (i / (HOURS - 1)) * (W - PAD.l - PAD.r);
  const y = (t: number) => PAD.t + (1 - (t - lo) / Math.max(hi - lo, 1)) * (H - PAD.t - PAD.b);
  const ticks: number[] = [];
  const step = hi - lo > 30 ? 10 : 5;
  for (let t = lo; t <= hi; t += step) ticks.push(t);

  // direct labels at the line ends (only for a few series), nudged apart so they don't collide
  const ends = series.map((s) => ({ s, y: y(s.temps[s.temps.length - 1]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * (W - PAD.l - PAD.r);
    setHover(Math.max(0, Math.min(HOURS - 1, Math.round((px / (W - PAD.l - PAD.r)) * (HOURS - 1)))));
  }

  const fmt = (t: number) => `${Math.round(t)}°`;

  return (
    <figure className="chart">
      <figcaption>
        <strong>Temperature, next 24 hours</strong>
        <ul className="chart-legend">
          {series.map((s) => (
            <li key={s.color}><span style={{ background: s.color }} />{s.name}</li>
          ))}
        </ul>
      </figcaption>
      <div className="chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart of temperature for the next 24 hours at each saved place. The table above lists the same places.">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="chart-grid" />
              <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="chart-axis">{t}°</text>
            </g>
          ))}
          {[0, 6, 12, 18, 23].map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="chart-axis">{i === 0 ? "Now" : `+${i}h`}</text>
          ))}
          {series.map((s) => (
            <polyline
              key={s.color}
              points={s.temps.map((t, i) => `${x(i)},${y(t)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {series.length <= 4 &&
            ends.map(({ s, y: ly }) => (
              <text key={s.color} x={W - PAD.r + 8} y={ly + 4} className="chart-label">{s.name.length > 14 ? s.name.slice(0, 13) + "…" : s.name}</text>
            ))}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} className="chart-cross" />
              {series.map((s) => (
                <circle key={s.color} cx={x(hover)} cy={y(s.temps[hover])} r={4.5} fill={s.color} stroke="#0d192c" strokeWidth={2} />
              ))}
            </g>
          )}
          <rect
            x={PAD.l}
            y={0}
            width={W - PAD.l - PAD.r}
            height={H}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
        {hover !== null && (
          <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%`, transform: hover > 15 ? "translateX(calc(-100% - 12px))" : undefined }}>
            <div className="chart-tip-head">{hover === 0 ? "Now" : `In ${hover} h`}</div>
            {[...series].sort((a, b) => b.temps[hover] - a.temps[hover]).map((s) => (
              <div key={s.color} className="chart-tip-row">
                <span style={{ background: s.color }} />{s.name}<b>{fmt(s.temps[hover])}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}
