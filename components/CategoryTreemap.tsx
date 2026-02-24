"use client";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Televisores", size: 45000, fill: "#3b82f6" },
  { name: "Línea Blanca", size: 38000, fill: "#10b981" },
  { name: "Celulares", size: 30000, fill: "#f59e0b" },
  { name: "Audio", size: 20000, fill: "#8b5cf6" },
  { name: "Computación", size: 15000, fill: "#ef4444" },
  { name: "Accesorios", size: 8000, fill: "#06b6d4" },
  { name: "Muebles", size: 5000, fill: "#6366f1" },
];

// 🔹 1. CREAMOS UN DIBUJANTE PERSONALIZADO (Evita errores y pone el texto)
const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, fill } = props;

  // Si la caja es muy pequeña, no intentamos dibujar nada para evitar errores
  if (width < 10 || height < 10) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fill || "#3b82f6",
          stroke: "#0f1015", // Borde oscuro para separar las cajas
          strokeWidth: 2,
        }}
      />
      {/* Solo dibujamos el texto si la caja es lo suficientemente grande */}
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={13}
          fontWeight="bold"
          dominantBaseline="central"
        >
          {name}
        </text>
      )}
    </g>
  );
};

export default function CategoryTreemap({ filters }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="size"
        ratio={4 / 3}
        stroke="#0f1015"
        content={<CustomizedContent />} // 🔹 2. INYECTAMOS NUESTRO DIBUJANTE AQUÍ
      >
        <Tooltip
          formatter={(value: any) => `RD$ ${Number(value).toLocaleString()}`}
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            color: "#f3f4f6",
            borderRadius: "0.5rem"
          }}
          itemStyle={{ color: "#e5e7eb" }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}