"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  Briefcase, 
  Activity
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Executive Overview", path: "/executive", icon: LayoutDashboard },
    { name: "Clientes & Mercado", path: "/customer", icon: Users },
    { name: "Portafolio & Rent.", path: "/portafolio", icon: PieChart },
    { name: "Fuerza Comercial", path: "/fuerza", icon: Briefcase },
    { name: "Analítica Avanzada", path: "/avanzada", icon: Activity },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#0f1015] border-r border-gray-800/50 flex flex-col">
      
      {/* 🔹 SECCIÓN DEL LOGO FICTICIO (SVG Integrado) */}
      <div className="h-24 flex items-center px-6 border-b border-gray-800/50 mb-6">
        <div className="flex items-center gap-3">
          {/* Ícono del Logo con efecto neón */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <svg 
              className="w-6 h-6 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
              <circle cx="19" cy="9" r="2" fill="currentColor" />
            </svg>
          </div>
          {/* Texto del Logo */}
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wide leading-tight">
              Retail Scope
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">
              Analytics RD
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 shadow-[inset_4px_0_0_0_rgba(59,130,246,1)]" // Efecto activo con línea lateral
                    : "text-gray-400 hover:bg-[#191c24] hover:text-white"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-blue-400" : "text-gray-500 group-hover:text-white"
                  }`}
                />
                <span className="font-medium text-sm tracking-wide">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 🔹 PIE DEL SIDEBAR */}
      <div className="p-6 border-t border-gray-800/50">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#191c24] rounded-lg border border-gray-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-xs font-medium text-gray-400">Sistema en línea</span>
        </div>
      </div>

    </aside>
  );
}