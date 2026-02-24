"use client";

import { useEffect, useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function CustomerParetoChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-pareto?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any, index: number) => ({
          index: index + 1,
          sales: Number(item.sales),
          cumulative: Number(item.cumulative_pct),
        }));
        setData(formatted);
      });
  }, [filters]);

  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-500">Cargando Pareto...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis dataKey="index" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" />
        <Tooltip 
          formatter={(value: any, name?: string) => name === "Ventas" ? `RD$ ${Number(value).toLocaleString()}` : `${value}%`}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} 
        />
        <Legend wrapperStyle={{ color: "#9ca3af" }} />

        <Bar yAxisId="left" dataKey="sales" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Acumulado %" stroke="#f59e0b" strokeWidth={3} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}