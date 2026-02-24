"use client";
import { useFilters } from "@/store/filters";

export default function FiltersBar() {
  const { startDate, endDate, setFilters } = useFilters();

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex gap-4 items-center">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setFilters({ startDate: e.target.value })}
        className="border rounded-lg p-2"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setFilters({ endDate: e.target.value })}
        className="border rounded-lg p-2"
      />
    </div>
  );
}