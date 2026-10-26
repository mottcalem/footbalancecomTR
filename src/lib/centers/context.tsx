import { createContext, useContext } from "react";
import type { ManagedCenter } from "./schema";
export const CentersContext = createContext<ManagedCenter[]>([]);
export function useCenters() {
  const centers = useContext(CentersContext);
  return {
    centers,
    cities: [...new Set(centers.map((c) => c.city))].sort((a, b) => a.localeCompare(b, "tr")),
  };
}
