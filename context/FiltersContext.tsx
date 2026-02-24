"use client";

import { createContext, useContext, useState } from "react";

const FiltersContext = createContext<any>(null);

export function FiltersProvider({ children }: any) {
  const [filters, setFilters] = useState({
    year: "2024",
    region: "ALL",
    distributor: "ALL",
  });

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  return useContext(FiltersContext);
}