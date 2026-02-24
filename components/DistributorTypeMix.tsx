"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#f59e0b", "#8b5cf6", "#3b82f6", "#ef4444"];

export default function DistributorTypeMix({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/fuerza-distributor-mix?${query}`)
      .then(res => res.json())
      .then(raw => {
        // 🔹 CORRECCIÓN: Usamos 'type' y 'value' como viene de la API
        const formatted = raw.map((item: any) => ({
          type: item.type,
          value: Number(item.value)
        }));
        setData(formatted);
      });
  }, [filters]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        {/* 🔹 Recharts lee dataKey="value" y nameKey="type", ahora sí coinciden */}
        <Pie data={data} dataKey="value" nameKey="type" innerRadius={60} outerRadius={100} stroke="#191c24" strokeWidth={2}>
          {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(val: any) => `RD$ ${Number(val).toLocaleString()}`} contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} />
        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}