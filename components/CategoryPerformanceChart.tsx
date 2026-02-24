"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function CategoryPerformanceChart({ filters }: any) {
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

    fetch(`/api/category-performance?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((r: any) => ({
          name: r.category_name,
          sales: Number(r.total_sales),
        }));
        setData(formatted);
      });
  }, [filters]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        {/* Cuadrícula sutil oscura */}
        <CartesianGrid stroke="#374151" />
        <XAxis type="number" tick={{ fill: "#9ca3af" }} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#9ca3af" }} />
        
        {/* Tooltip en Dark Mode */}
        <Tooltip
          formatter={(value: any) => `RD$ ${Number(value).toLocaleString()}`}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
        />

        <Bar dataKey="sales" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={categoryColors[entry.name] || "#2563eb"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}