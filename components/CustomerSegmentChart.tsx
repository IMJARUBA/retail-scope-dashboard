"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function CustomerSegmentChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-segment?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any) => ({
          name: item.customer_segment,
          value: Number(item.total_customers),
        }));
        setData(formatted);
      });
  }, [filters]);

  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-500">Cargando segmentación...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} stroke="#191c24" strokeWidth={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} />
        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}