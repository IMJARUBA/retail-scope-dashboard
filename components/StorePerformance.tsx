"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function StorePerformance({ filters }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams(filters).toString();
    
    // 🔹 Apuntamos a la nueva API
    fetch(`/api/fuerza-store?${query}`)
      .then(res => res.json())
      .then(raw => {
        if (raw.error) {
          setError(raw.error);
          setLoading(false);
          return;
        }
        if (!Array.isArray(raw)) {
          setError("Formato de datos inválido.");
          setLoading(false);
          return;
        }

        // 🔹 Mapeamos 'store' en lugar de 'manager'
        const formatted = raw.map((item: any) => ({
          store: item.store || "Tienda Desconocida",
          sales: Number(item.sales) || 0,
        }));

        setData(formatted);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filters]);

  if (loading) return <div className="h-full flex items-center justify-center text-gray-500">⏳ Cargando tiendas...</div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-500 text-sm px-4">⚠️ Error: {error}</div>;
  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-500">📭 No hay ventas registradas</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />
        
        <XAxis 
          type="number" 
          tickFormatter={(val) => `RD$ ${(val/1000000).toFixed(1)}M`} 
          tick={{ fill: "#9ca3af", fontSize: 12 }} 
        />
        
        {/* 🔹 Leemos el dataKey "store" */}
        <YAxis 
          type="category" 
          dataKey="store" 
          width={110} 
          tick={{ fill: "#9ca3af", fontSize: 11 }} 
        />
        
        <Tooltip 
          formatter={(val: any) => `RD$ ${Number(val).toLocaleString()}`} 
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} 
          cursor={{ fill: "#374151", opacity: 0.4 }} 
        />
        
        <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill="#10b981" /> 
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}