// lib/helpers/location.ts
import lgasData from "@/lib/data/lgas.json";

export interface Lga {
  id: number;
  name: string;
  state_code: string;
  state_name: string;
  latitude: number;
  longitude: number;
  // ... other fields as needed
}

// Get all unique states (memoized)
export const getStates = (): { code: string; name: string }[] => {
  const stateMap = new Map<string, { code: string; name: string }>();
  lgasData.forEach((lga: Lga) => {
    if (!stateMap.has(lga.state_code)) {
      stateMap.set(lga.state_code, {
        code: lga.state_code,
        name: lga.state_name,
      });
    }
  });
  return Array.from(stateMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

// Get LGAs for a specific state code
export const getLgasByState = (stateCode: string): Lga[] => {
  return lgasData.filter((lga: Lga) => lga.state_code === stateCode);
};

// Find LGA by ID
export const getLgaById = (id: number): Lga | undefined => {
  return lgasData.find((lga: Lga) => lga.id === id);
};

// Find LGA by name (case-insensitive, partial match)
export const findLgaByName = (name: string, stateCode?: string): Lga[] => {
  const query = name.toLowerCase().trim();
  const source = stateCode ? getLgasByState(stateCode) : lgasData;
  return source.filter((lga: Lga) => lga.name.toLowerCase().includes(query));
};

// Get coordinates for an LGA
export const getLgaCoordinates = (
  lgaId: number
): { lat: number; lng: number } | null => {
  const lga = getLgaById(lgaId);
  return lga ? { lat: lga.latitude, lng: lga.longitude } : null;
};

// Format LGA for Ant Design Select options
export const formatLgaOptions = (lgas: Lga[]) => {
  return lgas.map((lga) => ({
    value: lga.id,
    label: lga.name,
    // Optional: add metadata for custom rendering
    meta: {
      state: lga.state_name,
      coords: { lat: lga.latitude, lng: lga.longitude },
    },
  }));
};

// Search helper for async Select
export const searchLgas = (query: string, stateCode?: string) => {
  if (!query.trim()) return stateCode ? getLgasByState(stateCode) : lgasData;
  return findLgaByName(query, stateCode);
};
