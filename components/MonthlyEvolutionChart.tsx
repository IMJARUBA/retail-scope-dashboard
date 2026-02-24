"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

export default function MonthlyEvolutionChart({ filters }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/monthly-evolution?${query}`)
      .then((res) => res.json())
      .then((rawData) => {
        const formatted = rawData.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString("es-DO", {
            month: "short",
            year: "2-digit",
          }),
          sales: Number(item.total_sales),
          invoices: Number(item.total_invoices),
        }));

        setData(formatted);
      });
  }, [filters]);

  if (!data.length) 
    return <div className="h-full flex items-center justify-center text-gray-500">Cargando gráfico...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
        
        <XAxis 
          dataKey="month" 
          tick={{ fill: "#9ca3af", fontSize: 12 }} 
          tickMargin={10}
        />
        
        <YAxis 
          yAxisId="left" 
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />
        
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          tick={{ fill: "#9ca3af", fontSize: 12 }} 
        />
        
        <Tooltip
          formatter={(value: any, name: any) => {
            if (name === "sales") return [`RD$ ${Number(value).toLocaleString()}`, "Ventas"];
            if (name === "invoices") return [Number(value).toLocaleString(), "Facturas"];
            return value;
          }}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
        />
        
        <Legend wrapperStyle={{ color: "#9ca3af" }} />

        <Line
          yAxisId="left"
          type="monotone"
          dataKey="sales"
          name="sales"
          stroke="#10b981" // Verde esmeralda (contrasta excelente en oscuro)
          strokeWidth={3}
          dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="invoices"
          name="invoices"
          stroke="#3b82f6" // Azul vibrante
          strokeWidth={3}
          dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}