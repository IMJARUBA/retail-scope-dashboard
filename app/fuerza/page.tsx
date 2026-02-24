"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Briefcase, Truck, DollarSign, Target } from "lucide-react";

import { useFilters } from "@/context/FiltersContext";

const DistributorLeaderboard = dynamic(() => import("@/components/DistributorLeaderboard"), { ssr: false });
const DistributorTypeMix = dynamic(() => import("@/components/DistributorTypeMix"), { ssr: false });
const StorePerformance = dynamic(() => import("@/components/StorePerformance"), { ssr: false });
const CommissionVsSalesChart = dynamic(() => import("@/components/CommissionVsSalesChart"), { ssr: false });

export default function FuerzaComercialPage() {
  const { filters } = useFilters();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    // Esta API la crearemos después
    fetch(`/api/fuerza-kpis?${query}`)
      .then(res => res.json())
      .then(setData);
  }, [filters]);

  if (!data) return <div className="min-h-screen bg-[#0f1015] text-gray-400 flex items-center justify-center">Cargando métricas comerciales...</div>;

  const activeDistributors = Number(data.active_distributors) || 0;
  const totalCommissions = Number(data.total_commissions) || 0;
  const avgCommissionPct = Number(data.avg_commission_pct) || 0;
  const b2bSales = Number(data.b2b_sales) || 0;

  const yoyDistributors = Number(data.yoy_distributors) || 0;
  const yoyCommissions = Number(data.yoy_commissions) || 0;
  const yoyCommissionPct = Number(data.yoy_commission_pct) || 0;
  const yoyB2bSales = Number(data.yoy_b2b_sales) || 0;

  const formatMillions = (value: number) => `RD$ ${(value / 1_000_000).toFixed(1)}M`;

  const Trend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className="mt-3 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
        </span>
        <span className="text-gray-500 ml-2">vs Año Anterior</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1015] p-6 md:p-10 space-y-8 font-sans">
      
      {/* 🔹 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Distribuidores Activos</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Truck size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {activeDistributors}
          </span>
          {Trend(yoyDistributors)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Ventas B2B (Distribuidores)</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Briefcase size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {formatMillions(b2bSales)}
          </span>
          {Trend(yoyB2bSales)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Comisiones Pagadas</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><DollarSign size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {formatMillions(totalCommissions)}
          </span>
          {/* Aquí un aumento en comisiones puede ser bueno si suben las ventas, o malo si es ineficiencia */}
          {Trend(yoyCommissions)} 
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">% Comisión Promedio</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Target size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {avgCommissionPct.toFixed(1)}%
          </span>
          {Trend(yoyCommissionPct)}
        </div>
      </div>

      {/* 🔹 DISTRIBUIDORES Y COMISIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Eficiencia: Ventas vs Comisiones</h2>
          <div className="h-[380px]">
            <CommissionVsSalesChart filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Mix por Tipo de Distribuidor</h2>
          <div className="h-[380px]">
            <DistributorTypeMix filters={filters} />
          </div>
        </div>
      </div>

      {/* 🔹 RANKINGS (EXTERNO E INTERNO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Top 10 Distribuidores (Fuerza Externa)</h2>
          <div className="h-[400px]">
            <DistributorLeaderboard filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Top Sucursales (Fuerza Interna)</h2>
          <div className="h-[400px]">
            <StorePerformance filters={filters} />
          </div>
        </div>
      </div>

    </div>
  );
}