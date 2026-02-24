import { create } from "zustand";

interface FilterState {
  startDate: string;
  endDate: string;
  region: string;
  city: string;
  distributor: string;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const useFilters = create<FilterState>((set) => ({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  region: "",
  city: "",
  distributor: "",
  setFilters: (filters) =>
    set((state) => ({ ...state, ...filters })),
}));