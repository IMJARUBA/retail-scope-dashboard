"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Users, UserPlus, Repeat, ShoppingBag } from "lucide-react";

import { useFilters } from "@/context/FiltersContext";

const CustomerEvolutionChart = dynamic(() => import("@/components/CustomerEvolutionChart"), { ssr: false });
const CustomerSegmentChart = dynamic(() => import("@/components/CustomerSegmentChart"), { ssr: false });
const TopCustomersChart = dynamic(() => import("@/components/TopCustomerChart"), { ssr: false });
const CustomerParetoChart = dynamic(() => import("@/components/CustomerParetoChart"), { ssr: false });
const CustomerSegmentPerformanceChart = dynamic(() => import("@/components/CustomerSegmentPerformanceChart"), { ssr: false });
const CustomerMap = dynamic(() => import("@/components/CustomerMap"), { ssr: false });

export default function CustomersPage() {
  const { filters } = useFilters();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-kpis?${query}`)
      .then(res => res.json())
      .then(setData);
  }, [filters]);

  if (!data) return <div className="min-h-screen bg-[#0f1015] text-gray-400 flex items-center justify-center">Cargando métricas de clientes...</div>;

  const activeCustomers = Number(data.active_customers) || 0;
  const newCustomers = Number(data.new_customers) || 0;
  const retentionRate = Number(data.retention_rate) || 0;
  const avgTicket = Number(data.avg_ticket_per_customer) || 0;

  const yoyActive = Number(data.yoy_active) || 0;
  const yoyNew = Number(data.yoy_new) || 0;
  const yoyRetention = Number(data.yoy_retention) || 0;
  const yoyTicket = Number(data.yoy_ticket) || 0;

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
            <span className="text-sm font-medium text-gray-400">Clientes Activos</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Users size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {activeCustomers.toLocaleString()}
          </span>
          {Trend(yoyActive)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Nuevos Clientes</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><UserPlus size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {newCustomers.toLocaleString()}
          </span>
          {Trend(yoyNew)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Tasa de Retención</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Repeat size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {retentionRate.toFixed(1)}%
          </span>
          {Trend(yoyRetention)}
        </div>

        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Gasto Prom. (ARPU)</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><ShoppingBag size={20} /></div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            RD$ {avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          {Trend(yoyTicket)}
        </div>
      </div>

      {/* 🔹 MAPA & EVOLUCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col">
          <h2 className="text-lg font-medium text-white mb-6">Mapa de Cobertura de Clientes</h2>
          <div className="flex-1 border border-gray-800/50 rounded-xl overflow-hidden min-h-[400px]">
            <CustomerMap filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Evolución de Base de Clientes</h2>
          <div className="h-[400px]">
            <CustomerEvolutionChart filters={filters} />
          </div>
        </div>
      </div>

      {/* 🔹 SEGMENTACIÓN Y PARETO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Segmentación de Clientes</h2>
          <div className="h-[350px]">
            <CustomerSegmentChart filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Análisis Pareto 80/20</h2>
          <div className="h-[350px]">
            <CustomerParetoChart filters={filters} />
          </div>
        </div>
      </div>

      {/* 🔹 DESEMPEÑO POR SEGMENTO & TOP CLIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Desempeño por Segmento</h2>
          <div className="h-[420px]">
            <CustomerSegmentPerformanceChart filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">Top 20 Clientes por Ventas</h2>
          <div className="h-[420px]">
            <TopCustomersChart filters={filters} />
          </div>
        </div>
      </div>

    </div>
  );
}