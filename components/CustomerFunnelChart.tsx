"use client";
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Base Total (Registrados)", value: 15000, fill: "#3b82f6" },
  { name: "Compraron (1 vez)", value: 8500, fill: "#10b981" },
  { name: "Recurrentes (2+ veces)", value: 3200, fill: "#f59e0b" },
  { name: "VIP (Alta Frecuencia)", value: 850, fill: "#8b5cf6" },
];

export default function CustomerFunnelChart({ filters }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip 
          formatter={(value: any) => `${value.toLocaleString()} clientes`}
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }}
        />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList position="right" fill="#9ca3af" stroke="none" dataKey="name" fontSize={12} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}