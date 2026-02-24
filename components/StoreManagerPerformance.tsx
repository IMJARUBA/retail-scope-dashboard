"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function StoreManagerPerformance({ filters }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reseteamos estados al cambiar filtros
    setLoading(true);
    setError(null);

    const query = new URLSearchParams(filters).toString();
    fetch(`/api/fuerza-store-manager?${query}`)
      .then(res => res.json())
      .then(raw => {
        // 1. Si la API devuelve un error de BD, lo atrapamos
        if (raw.error) {
          setError(raw.error);
          setLoading(false);
          return;
        }

        // 2. Si no es un Array (por algún fallo de red), evitamos el .map()
        if (!Array.isArray(raw)) {
          setError("La API no devolvió una lista válida.");
          setLoading(false);
          return;
        }

        // 3. Mapeo seguro
        const formatted = raw.map((item: any) => ({
          manager: item.manager || "Sin nombre",
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

  // 🔹 Pantallas de estado
  if (loading) 
    return <div className="h-full flex items-center justify-center text-gray-500">⏳ Cargando métricas...</div>;
  
  if (error) 
    return <div className="h-full flex items-center justify-center text-red-500 text-sm text-center px-4">⚠️ Ocurrió un error: {error}</div>;
  
  if (!data.length) 
    return <div className="h-full flex items-center justify-center text-gray-500">📭 No hay ventas para estos filtros</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />
        
        <XAxis 
          type="number" 
          tickFormatter={(val) => `RD$ ${(val/1000000).toFixed(1)}M`} 
          tick={{ fill: "#9ca3af", fontSize: 12 }} 
        />
        
        <YAxis 
          type="category" 
          dataKey="manager" 
          width={90} 
          tick={{ fill: "#9ca3af", fontSize: 11 }} 
        />
        
        <Tooltip 
          formatter={(val: any) => `RD$ ${Number(val).toLocaleString()}`} 
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6" }} 
          cursor={{ fill: "#374151", opacity: 0.4 }} 
        />
        
        <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill="#10b981" /> /* Verde Esmeralda */
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}