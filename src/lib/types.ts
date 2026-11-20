export type Place = {
  name: string;
  lat: number;
  lon: number;
  // search / device: map flies there. pick / city: user clicked the map, so no camera move.
  // pick and device are named by reverse geocoding; the others already have a name.
  kind: "search" | "device" | "pick" | "city";
  pending?: boolean; // true while the name is still being looked up
};

export type SavedPlace = { id: string; name: string; lat: number; lon: number };
export const placeId = (lat: number, lon: number) => `${lat.toFixed(2)},${lon.toFixed(2)}`;
