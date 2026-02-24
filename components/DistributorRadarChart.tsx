"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { subject: "Volumen Ventas", A: 120, fullMark: 150 },
  { subject: "Margen Neto", A: 98, fullMark: 150 },
  { subject: "Retención", A: 86, fullMark: 150 },
  { subject: "Crecimiento YoY", A: 99, fullMark: 150 },
  { subject: "Satisfacción", A: 85, fullMark: 150 },
  { subject: "Mix Producto", A: 65, fullMark: 150 },
];

export default function DistributorRadarChart({ filters }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} 
        />
        <Radar 
          name="Dist. Corripio" 
          dataKey="A" 
          stroke="#10b981" // Verde Esmeralda Neón
          strokeWidth={3}
          fill="#10b981" 
          fillOpacity={0.3} 
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}