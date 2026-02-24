"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Filters = {
  year: string;
  region: string;
  distributor: string;
};

type Props = {
  filters: Filters;
};

// Colores un poco más vibrantes para fondo oscuro
const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function RegionDonutChart({ filters }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/sales-by-region?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any) => ({
          name: item.region_group ?? item.region,
          value: Number(item.total_sales),
        }));

        setData(formatted);
      });
  }, [filters]);

  if (!data.length)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Cargando...
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          stroke="#191c24" // Borde del color de la tarjeta para separar
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value: any) => `RD$ ${Number(value).toLocaleString()}`}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
        />
        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}