"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";

export default function TopProductsChart({ filters }: any) {
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

    fetch(`/api/top-products?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any) => ({
          name: item.product_name,
          units: Number(item.total_units) || 0,
          sales: Number(item.total_sales) || 0,
          category: item.category_name || "Otros",
        }));

        setData(formatted);
      });
  }, [filters]);

  if (!data.length)
    return (
      <div className="h-[450px] flex items-center justify-center text-gray-500">
        Sin datos disponibles
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        layout="vertical"
        margin={{ left: 20, top: 20, right: 20, bottom: 20 }}
      >
        <CartesianGrid stroke="#374151" />

        <YAxis
          type="category"
          dataKey="name"
          width={220}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />

        <XAxis
          type="number"
          xAxisId="bottom"
          orientation="bottom"
          tick={{ fill: "#9ca3af" }}
        />

        <XAxis
          type="number"
          xAxisId="top"
          orientation="top"
          hide
          tick={{ fill: "#9ca3af" }}
        />

        <Tooltip
          formatter={(value: any, name: any) => {
            if (name === "Unidades") return `${Number(value).toLocaleString()} unidades`;
            if (name === "Ventas") return `RD$ ${Number(value).toLocaleString()}`;
            return value;
          }}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
        />

        <Legend wrapperStyle={{ color: "#9ca3af" }} />

        <Bar
          dataKey="units"
          name="Unidades"
          xAxisId="bottom"
          radius={[0, 8, 8, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={categoryColors[entry.category] || "#2563eb"} />
          ))}
        </Bar>

        {/* Línea de ventas ahora es BLANCA para que resalte en el fondo oscuro */}
        <Line
          dataKey="sales"
          name="Ventas"
          xAxisId="top"
          type="monotone"
          stroke="#ffffff" 
          strokeWidth={2}
          dot={{ r: 4, fill: "#ffffff" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}