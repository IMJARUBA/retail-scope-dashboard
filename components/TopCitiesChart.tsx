"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

type Filters = {
  year: string;
  region: string;
  distributor: string;
};

type Props = {
  filters: Filters;
};

export default function TopCitiesChart({ filters }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/sales-by-city?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw
          .map((item: any) => ({
            city: item.city_name,
            sales: Number(item.total_sales),
          }))
          .sort((a: any, b: any) => b.sales - a.sales)
          .slice(0, 10);

        setData(formatted);
      });
  }, [filters]);

  if (!data.length)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Cargando ranking...
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 20, right: 20 }}
      >
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />

        <XAxis
          type="number"
          tickFormatter={(value) => `RD$ ${(value / 1000000).toFixed(1)}M`}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />

        <YAxis
          type="category"
          dataKey="city"
          width={100}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />

        <Tooltip
          formatter={(value: any) => `RD$ ${Number(value).toLocaleString()}`}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
          cursor={{ fill: "#374151", opacity: 0.4 }} // Cursor oscuro al pasar el mouse
        />

        <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill="#3b82f6" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}