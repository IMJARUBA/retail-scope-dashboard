"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  DollarSign,
  Percent,
  Receipt,
  ShoppingCart,
  Smartphone,
} from "lucide-react";

import { useFilters } from "@/context/FiltersContext";

const SalesMap = dynamic(() => import("@/components/SalesMap"), { ssr: false });
const TopCitiesChart = dynamic(() => import("@/components/TopCitiesChart"), { ssr: false });
const RegionDonutChart = dynamic(() => import("@/components/RegionDonutChart"), { ssr: false });
const MonthlyEvolutionChart = dynamic(() => import("@/components/MonthlyEvolutionChart"), { ssr: false });

export default function ExecutivePage() {
  const { filters } = useFilters();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/kpis?${query}`)
      .then((res) => res.json())
      .then(setData);
  }, [filters]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f1015] flex items-center justify-center text-gray-400">
        Cargando métricas...
      </div>
    );
  }

  // 🔹 VARIABLES CORREGIDAS SEGÚN TU CÓDIGO ORIGINAL
  const totalSales = Number(data.total_sales) || 0;
  const avgMargin = Number(data.avg_margin) || 0;
  const invoices = Number(data.invoices) || 0;
  const avgTicket = invoices > 0 ? totalSales / invoices : 0;
  const digitalShare = Number(data.digital_share) || 0;

  const yoySales = Number(data.yoy_sales) || 0;
  const yoyMargin = Number(data.yoy_margin) || 0;
  const yoyInvoices = Number(data.yoy_invoices) || 0;
  const yoyTicket = Number(data.yoy_ticket) || 0;

  const formatMillions = (value: number) =>
    `RD$ ${(value / 1_000_000).toFixed(1)}M`;

  // 🔹 FUNCIÓN TREND ADAPTADA A MODO OSCURO
  const Trend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className="mt-3 flex items-center text-sm">
        <span
          className={`flex items-center font-medium ${
            isPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
        </span>
        <span className="text-gray-500 ml-2">vs Año Anterior</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1015] p-6 md:p-10 space-y-8 font-sans">
      
      {/* 🔹 KPIs CON TENDENCIAS (YoY) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        
        {/* KPI 1: Ventas Totales */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Ventas Totales</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {formatMillions(totalSales)}
          </span>
          {Trend(yoySales)}
        </div>

        {/* KPI 2: Margen Promedio */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Margen Prom.</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Percent size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {avgMargin.toFixed(1)}%
          </span>
          {Trend(yoyMargin)}
        </div>

        {/* KPI 3: Facturas */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Facturas</span>
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
              <Receipt size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {invoices.toLocaleString()}
          </span>
          {Trend(yoyInvoices)}
        </div>

        {/* KPI 4: Ticket Promedio */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Ticket Prom.</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <ShoppingCart size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            RD$ {avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          {Trend(yoyTicket)}
        </div>

        {/* KPI 5: Part. Digital */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Part. Digital</span>
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <Smartphone size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {digitalShare.toFixed(1)}%
          </span>
          {/* Si tuvieras yoyDigital, lo pondrías aquí */}
          <div className="mt-3 flex items-center text-sm">
            <span className="text-gray-500">Canal Online</span>
          </div>
        </div>

      </div>

      {/* 🔹 EVOLUCIÓN */}
      <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-lg font-medium text-white mb-6">
          Evolución Mensual — Ventas vs Facturas
        </h2>
        <div className="h-[400px]">
           <MonthlyEvolutionChart filters={filters} />
        </div>
      </div>

      {/* 🔹 MAPA + DERECHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mapa */}
        <div className="lg:col-span-8 bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col">
          <h2 className="text-lg font-medium text-white mb-6">
            Mapa de Ventas
          </h2>
          <div className="flex-1 border border-gray-800/50 rounded-xl overflow-hidden min-h-[400px]">
            <SalesMap filters={filters} />
          </div>
        </div>

        {/* Top Ciudades y Regiones */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex-1">
            <h2 className="text-lg font-medium text-white mb-6">
              Top 10 Ciudades
            </h2>
            <div className="h-[300px]">
              <TopCitiesChart filters={filters} />
            </div>
          </div>

          <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex-1">
            <h2 className="text-lg font-medium text-white mb-6">
              Ventas por Región
            </h2>
            <div className="h-[300px]">
              <RegionDonutChart filters={filters} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}