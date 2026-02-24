"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PortfolioParetoChart({ filters }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/portfolio-pareto?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((r: any, index: number) => ({
          index: index + 1,
          cumulative: Number(r.cumulative_pct),
        }));
        setData(formatted);
      });
  }, [filters]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#374151" />
        <XAxis dataKey="index" tick={{ fill: "#9ca3af" }} />
        <YAxis unit="%" tick={{ fill: "#9ca3af" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
          itemStyle={{ color: "#e5e7eb" }}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#16a34a"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}