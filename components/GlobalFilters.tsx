"use client";

import { useFilters } from "@/context/FiltersContext";

export default function GlobalFilters() {
  const { filters, setFilters } = useFilters();

  return (
    <div className="
      sticky top-0 z-40
      bg-[#0f1015]/80 backdrop-blur-md
      border-b border-gray-800/50
      px-6 md:px-10 py-5
      flex flex-wrap gap-8 items-end
    ">

      {/* Año */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Año</label>
        <select
          className="px-4 py-2.5 rounded-xl bg-[#191c24] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-600 cursor-pointer shadow-sm"
          value={filters.year}
          onChange={(e) =>
            setFilters({ ...filters, year: e.target.value })
          }
        >
          <option value="ALL">Todos</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* Región */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Región</label>
        <select
          className="px-4 py-2.5 rounded-xl bg-[#191c24] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-600 cursor-pointer shadow-sm"
          value={filters.region}
          onChange={(e) =>
            setFilters({ ...filters, region: e.target.value })
          }
        >
          <option value="ALL">Todas</option>
          <option value="Cibao Norte">Cibao Norte</option>
          <option value="Cibao Sur">Cibao Sur</option>
          <option value="El Valle">El Valle</option>
          <option value="Enriquillo">Enriquillo</option>
          <option value="Higuamo">Higuamo</option>
          <option value="Ozama">Ozama</option>
          <option value="Valdesia">Valdesia</option>
          <option value="Yuma">Yuma</option>
        </select>
      </div>

      {/* Distribuidor */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Distribuidor</label>
        <select
          className="px-4 py-2.5 rounded-xl bg-[#191c24] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-600 cursor-pointer shadow-sm"
          value={filters.distributor}
          onChange={(e) =>
            setFilters({ ...filters, distributor: e.target.value })
          }
        >
          <option value="ALL">Todos</option>
          <option value="Este Comercial">Este Comercial</option>
          <option value="Moda Caribeña SRL">Moda Caribeña SRL</option>
          <option value="Sur Logistics">Sur Logistics</option>
          <option value="Distribuidora Corripio">Distribuidora Corripio</option>
          <option value="Distribuidora Cibao">Distribuidora Cibao</option>
          <option value="RetailScope Direct">RetailScope Direct</option>
          <option value="Norte Trading Group">Norte Trading Group</option>
          <option value="Grupo Ramos Distribución">Grupo Ramos Distribución</option>
          <option value="Global Foods RD">Global Foods RD</option>
          <option value="TechImport Dominicana">TechImport Dominicana</option>
          <option value="CCN Distribución">CCN Distribución</option>
          <option value="Caribe Import SRL">Caribe Import SRL</option>
        </select>
      </div>

    </div>
  );
}