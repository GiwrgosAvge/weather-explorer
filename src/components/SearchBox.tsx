import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatPlaceLabel, searchPlaces, type GeocodingResult } from "../api/geocoding";
import type { Place } from "../lib/types";
import { joinPlaceParts } from "../lib/placeNames";

export default function SearchBox({ onSelect }: { onSelect: (p: Place) => void }) {
  const [text, setText] = useState("");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  useEffect(() => {
    const id = setTimeout(() => setTerm(text.trim()), 300);
    return () => clearTimeout(id);
  }, [text]);

  const enabled = term.length >= 2;
  const { data, isFetching, error } = useQuery({
    queryKey: ["geocode", term.toLowerCase()],
    queryFn: ({ signal }) => searchPlaces(term, signal),
    enabled,
    staleTime: 60 * 60 * 1000,
  });
  const results: GeocodingResult[] = enabled ? data ?? [] : [];

  function choose(r: GeocodingResult) {
    onSelect({ name: formatPlaceLabel(r), lat: r.latitude, lon: r.longitude, kind: "search" });
    setText(r.name);
    setTerm("");
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && results.length > 0) {
      e.preventDefault();
      choose(results[active >= 0 ? active : 0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && enabled;

  return (
    <div className="search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-label="Search for a city or place"
        placeholder="Search location…"
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {showList && (
        <ul id={listId} role="listbox" className="search-list">
          {error ? (
            <li className="search-note">Search isn't working right now. Try again in a moment.</li>
          ) : isFetching && results.length === 0 ? (
            <li className="search-note">Searching…</li>
          ) : results.length === 0 ? (
            <li className="search-note">No places found for “{term}”. Check the spelling or try a larger city nearby.</li>
          ) : (
            results.map((r, i) => (
              <li
                key={r.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(r)}
                onMouseEnter={() => setActive(i)}
              >
                <strong>{r.name}</strong>
                <span>{joinPlaceParts([r.admin1, r.country].filter((x) => x !== r.name))}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
