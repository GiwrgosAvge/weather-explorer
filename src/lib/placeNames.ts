// OpenStreetMap often names places by their administrative unit ("Municipality of Ilion",
// "Peloponnese Region"). People say "Ilion" and "Peloponnese", so strip those words.
const PREFIX = /^(municipal unit|municipality|regional unit|region|prefecture|district|county|province|city) of\s+/i;
const SUFFIX = /\s+(regional unit|region|municipality|prefecture|district|governorate)$/i;

export function cleanAdminName(s: string): string {
  return s.replace(PREFIX, "").replace(SUFFIX, "").trim();
}

/** Joins name parts, dropping blanks and repeats ("Tokyo, Tokyo, Japan" → "Tokyo, Japan"). */
export function joinPlaceParts(parts: (string | null | undefined)[]): string {
  const out: string[] = [];
  for (const p of parts) {
    const v = p?.trim();
    if (v && !out.some((o) => o.toLowerCase() === v.toLowerCase())) out.push(v);
  }
  return out.join(", ");
}
