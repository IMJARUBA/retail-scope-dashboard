"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Zap, ShieldCheck, Target } from "lucide-react";

import { useFilters } from "@/context/FiltersContext";

const CategoryTreemap = dynamic(() => import("@/components/CategoryTreemap"), { ssr: false });
const DistributorRadarChart = dynamic(() => import("@/components/DistributorRadarChart"), { ssr: false });
const ChannelMixAreaChart = dynamic(() => import("@/components/ChannelMixAreaChart"), { ssr: false });
const CustomerFunnelChart = dynamic(() => import("@/components/CustomerFunnelChart"), { ssr: false });

export default function AnaliticaAvanzadaPage() {
  const { filters } = useFilters();
  
  // 🔹 Datos simulados para los KPIs de la Demo
  const kpis = {
    operatividad: 94.2,
    ltv: 45200, // Valor de vida del cliente (Life Time Value)
    cac: 1250,  // Costo de Adquisición
    conversion: 18.5
  };

  const Trend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className="mt-3 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
        </span>
        <span className="text-gray-500 ml-2">vs mes anterior</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1015] p-6 md:p-10 space-y-8 font-sans">
      
      {/* 🔹 KPIs AVANZADOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Eficiencia Operativa</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Activity size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {kpis.operatividad}%
          </span>
          {Trend(2.4)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Life Time Value (LTV)</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Zap size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            RD$ {(kpis.ltv / 1000).toFixed(1)}k
          </span>
          {Trend(5.1)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Costo Adquisición (CAC)</span>
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg"><ShieldCheck size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            RD$ {kpis.cac}
          </span>
          {/* Un CAC menor es mejor, por lo que una caída es positiva */}
          {Trend(-1.2)} 
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Tasa Conversión (Embudo)</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Target size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {kpis.conversion}%
          </span>
          {Trend(0.8)}
        </div>
      </div>

      {/* 🔹 TREEMAP Y EMBUDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white">Mapa de Peso de Categorías (Treemap)</h2>
            <p className="text-sm text-gray-400">Tamaño = Volumen de Ventas | Permite detectar dependencias de producto.</p>
          </div>
          <div className="h-[400px]">
            <CategoryTreemap filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white">Embudo de Retención</h2>
            <p className="text-sm text-gray-400">Caída de usuarios por etapa.</p>
          </div>
          <div className="h-[400px]">
            <CustomerFunnelChart filters={filters} />
          </div>
        </div>
      </div>

      {/* 🔹 ÁREA APILADA Y RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white">Evolución de Mix de Canales</h2>
            <p className="text-sm text-gray-400">Desplazamiento del volumen de ventas a través del tiempo.</p>
          </div>
          <div className="h-[400px]">
            <ChannelMixAreaChart filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white">Salud Integral del Top Distribuidor</h2>
            <p className="text-sm text-gray-400">Evaluación multidimensional de rendimiento.</p>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <DistributorRadarChart filters={filters} />
          </div>
        </div>
      </div>

    </div>
  );
}