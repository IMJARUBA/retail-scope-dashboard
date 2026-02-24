"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const data = [
  { month: "Ene", retail: 4000, online: 1000, b2b: 2400 },
  { month: "Feb", retail: 3000, online: 1398, b2b: 2210 },
  { month: "Mar", retail: 2000, online: 3800, b2b: 2290 },
  { month: "Abr", retail: 2780, online: 3908, b2b: 2000 },
  { month: "May", retail: 1890, online: 4800, b2b: 2181 },
  { month: "Jun", retail: 2390, online: 5800, b2b: 2500 },
];

export default function ChannelMixAreaChart({ filters }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {/* Definición de los gradientes para un efecto visual premium */}
        <defs>
          <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorB2b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} />
        <Legend wrapperStyle={{ color: "#9ca3af", paddingTop: "10px" }} />

        <Area type="monotone" dataKey="retail" name="Retail (Tiendas)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRetail)" stackId="1" />
        <Area type="monotone" dataKey="online" name="E-Commerce" stroke="#10b981" fillOpacity={1} fill="url(#colorOnline)" stackId="1" />
        <Area type="monotone" dataKey="b2b" name="B2B Distribuidores" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorB2b)" stackId="1" />
      </AreaChart>
    </ResponsiveContainer>
  );
}