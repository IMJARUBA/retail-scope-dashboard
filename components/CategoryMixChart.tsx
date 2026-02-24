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

export default function CategoryMixChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  const categoryColors: any = {
    Ropa: "#2563eb",
    Calzado: "#16a34a",
    Tecnología: "#f59e0b",
    Hogar: "#ef4444",
    Otros: "#8b5cf6",
  };

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/category-mix?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((r: any) => ({
          name: r.category_name,
          value: Number(r.total_sales),
        }));
        setData(formatted);
      });
  }, [filters]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={70}
          outerRadius={110}
          stroke="#191c24" // Agregamos un borde del color de la tarjeta para separar los trozos
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={categoryColors[entry.name] || "#2563eb"} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value: any) => `RD$ ${Number(value).toLocaleString()}`}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
        />

        <Legend wrapperStyle={{ color: "#9ca3af" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}