"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DollarSign, TrendingUp, Percent, Package, PieChart } from "lucide-react";

import { useFilters } from "@/context/FiltersContext";

// COMPONENTES
const ProductMarginScatterChart = dynamic(() => import("@/components/ProductMarginScatterChart"), { ssr: false });
const CategoryPerformanceChart = dynamic(() => import("@/components/CategoryPerformanceChart"), { ssr: false });
const CategoryMixChart = dynamic(() => import("@/components/CategoryMixChart"), { ssr: false });
const PortfolioParetoChart = dynamic(() => import("@/components/PortfolioParetoChart"), { ssr: false });
const TopProductsChart = dynamic(() => import("@/components/TopProductChart"), { ssr: false });

export default function PortfolioPage() {
  const { filters } = useFilters();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/portfolio-kpis?${query}`)
      .then((res) => res.json())
      .then(setData);
  }, [filters]);

  if (!data)
    return (
      <div className="min-h-screen bg-[#0f1015] p-10 text-gray-400 flex items-center justify-center">
        Cargando métricas de portafolio...
      </div>
    );

  // 🔹 VARIABLES PRINCIPALES
  const totalSales = Number(data.total_sales) || 0;
  const grossProfit = Number(data.gross_profit) || 0;
  const avgMargin = Number(data.avg_margin) || 0;
  const activeSkus = Number(data.active_skus) || 0;
  const top20 = Number(data.top20_contribution) || 0;

  // 🔹 VARIABLES DE TENDENCIA (Asegúrate de que tu API las devuelva)
  const yoySales = Number(data.yoy_sales) || 0;
  const yoyProfit = Number(data.yoy_profit) || 0;
  const yoyMargin = Number(data.yoy_margin) || 0;
  const yoySkus = Number(data.yoy_skus) || 0;
  const yoyTop20 = Number(data.yoy_top20) || 0;

  const formatMillions = (value: number) =>
    `RD$ ${(value / 1_000_000).toFixed(1)}M`;

  // 🔹 FUNCIÓN TREND
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
      
      {/* 🔹 KPIs CON ICONOS Y TENDENCIAS */}
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

        {/* KPI 2: Utilidad Bruta */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Utilidad Bruta</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {formatMillions(grossProfit)}
          </span>
          {Trend(yoyProfit)}
        </div>

        {/* KPI 3: Margen Promedio */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Margen Promedio</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <Percent size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {avgMargin.toFixed(1)}%
          </span>
          {Trend(yoyMargin)}
        </div>

        {/* KPI 4: SKUs Activos */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">SKUs Activos</span>
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
              <Package size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {activeSkus.toLocaleString()}
          </span>
          {Trend(yoySkus)}
        </div>

        {/* KPI 5: Top 20% Contribución */}
        <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-400">Top 20% Contrib.</span>
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <PieChart size={20} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-semibold text-white tracking-wide">
            {top20.toFixed(1)}%
          </span>
          {Trend(yoyTop20)}
        </div>
      </div>

      {/* 🔹 SCATTER CENTRAL */}
      <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-lg font-medium text-white mb-6">
          Ventas vs Margen por Producto
        </h2>
        <div className="h-[400px]">
           <ProductMarginScatterChart filters={filters} />
        </div>
      </div>

      {/* 🔹 CATEGORÍAS + MIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">
            Desempeño por Categoría
          </h2>
          <div className="h-[350px]">
            <CategoryPerformanceChart filters={filters} />
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-medium text-white mb-6">
            Mix de Portafolio
          </h2>
          <div className="h-[350px]">
            <CategoryMixChart filters={filters} />
          </div>
        </div>
      </div>

      {/* 🔹 PARETO */}
      <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-lg font-medium text-white mb-6">
          Análisis Pareto 80/20 del Portafolio
        </h2>
        <div className="h-[400px]">
          <PortfolioParetoChart filters={filters} />
        </div>
      </div>

      {/* 🔹 TOP PRODUCTOS */}
      <div className="bg-[#191c24] rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-lg font-medium text-white mb-6">
          Top 20 Productos Más Vendidos
        </h2>
        <div className="h-[500px]">
          <TopProductsChart filters={filters} />
        </div>
      </div>

    </div>
  );
}