"use client";
import { useEffect, useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function CommissionVsSalesChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
      const query = new URLSearchParams(filters).toString();
      fetch(`/api/fuerza-commission-sales?${query}`)
        .then(res => res.json())
        .then(raw => {
          const formatted = raw.map((item: any) => ({
            name: item.name,
            sales: Number(item.sales),
            commission: Number(item.commission)
          }));
          setData(formatted);
        });
    }, [filters]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis yAxisId="left" tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip formatter={(val: any) => `RD$ ${Number(val).toLocaleString()}`} contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} />
        <Legend wrapperStyle={{ color: "#9ca3af" }} />

        <Bar yAxisId="left" dataKey="sales" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="commission" name="Comisiones Pagadas" stroke="#f59e0b" strokeWidth={3} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}