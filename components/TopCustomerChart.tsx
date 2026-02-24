"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function TopCustomersChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-top?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any) => ({
          name: item.full_name,
          sales: Number(item.total_sales),
        }));
        setData(formatted);
      });
  }, [filters]);

  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-500">Cargando Top Clientes...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(value) => `RD$ ${(value / 1_000_000).toFixed(1)}M`} tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip 
          formatter={(value: any) => `RD$ ${Number(value).toLocaleString()}`} 
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          cursor={{ fill: "#374151", opacity: 0.4 }}
        />
        <Bar dataKey="sales" name="Ventas" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill="#8b5cf6" /> /* Morado vibrante */
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}