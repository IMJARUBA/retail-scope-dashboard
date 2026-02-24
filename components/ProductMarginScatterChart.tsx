"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from "recharts";

interface Props {
  filters: any;
}

export default function ProductMarginScatterChart({ filters }: Props) {
  const [data, setData] = useState<any[]>([]);

  const categoryColors: any = {
    Ropa: "#2563eb",
    Calzado: "#16a34a",
    Tecnología: "#f59e0b",
    Hogar: "#ef4444",
    Otros: "#8b5cf6",
  };

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/product-margin-analysis?${query}`)
      .then((res) => res.json())
      .then((raw) => {
        const formatted = raw.map((item: any) => ({
          name: item.product_name,
          category: item.category_name,
          sales: Number(item.total_sales),
          margin: Number(item.avg_margin_pct),
          units: Number(item.total_units),
          color: categoryColors[item.category_name] || "#2563eb",
        }));

        setData(formatted);
      });
  }, [filters]);

  if (!data.length)
    return (
      <div className="h-[450px] flex items-center justify-center text-gray-500">
        Cargando análisis...
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        {/* Cuadrícula sutil oscura */}
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />

        <XAxis
          type="number"
          dataKey="sales"
          name="Ventas"
          tickFormatter={(value) => `RD$ ${(value / 1_000_000).toFixed(1)}M`}
          tick={{ fill: "#9ca3af" }} // Texto gris claro
        />

        <YAxis
          type="number"
          dataKey="margin"
          name="Margen %"
          unit="%"
          tick={{ fill: "#9ca3af" }} // Texto gris claro
        />

        <ZAxis type="number" dataKey="units" range={[60, 400]} />

        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;

              return (
                // Tooltip personalizado adaptado a Dark Mode
                <div className="bg-[#1f2937] p-4 rounded-xl shadow-lg border border-[#374151] text-sm text-gray-200">
                  <p className="font-semibold text-white">{d.name}</p>
                  <p className="text-gray-400 mb-2">{d.category}</p>
                  <p>Ventas: RD$ {d.sales.toLocaleString()}</p>
                  <p>Margen: {d.margin.toFixed(2)}%</p>
                  <p>Unidades: {d.units.toLocaleString()}</p>
                </div>
              );
            }
            return null;
          }}
        />

        <Scatter data={data}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}