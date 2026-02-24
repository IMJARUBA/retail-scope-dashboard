"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function CustomerEvolutionChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-evolution?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString("es-DO", { month: "short" }),
          active: Number(item.active_customers),
          new: Number(item.new_customers),
        }));
        setData(formatted);
      });
  }, [filters]);

  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-500">Cargando evolución...</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} itemStyle={{ color: "#e5e7eb" }} />
        <Legend wrapperStyle={{ color: "#9ca3af" }} />

        <Line type="monotone" dataKey="active" name="Activos" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} />
        <Line type="monotone" dataKey="new" name="Nuevos" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}