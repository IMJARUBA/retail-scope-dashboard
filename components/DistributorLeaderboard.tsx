"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function DistributorLeaderboard({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
      const query = new URLSearchParams(filters).toString();
      fetch(`/api/fuerza-distributor-leaderboard?${query}`)
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
      <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(val) => `RD$ ${(val/1000000).toFixed(0)}M`} tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip formatter={(val: any) => `RD$ ${Number(val).toLocaleString()}`} contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} cursor={{ fill: "#374151", opacity: 0.4 }} />
        <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill="#3b82f6" />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}