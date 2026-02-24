"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function CustomerSegmentPerformanceChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-segment-performance?${query}`)
      .then(res => res.json())
      .then(raw => {
        const formatted = raw.map((item: any) => ({
          segment: item.customer_segment,
          avg_ticket: Number(item.avg_ticket),
        }));
        setData(formatted);
      });
  }, [filters]);

  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-500">Cargando desempeño...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="segment" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip 
          formatter={(v: any) => `RD$ ${Number(v).toLocaleString()}`} 
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          cursor={{ fill: "#374151", opacity: 0.4 }}
        />
        <Bar dataKey="avg_ticket" name="Ticket Promedio" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}