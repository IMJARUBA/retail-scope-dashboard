"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type Filters = {
  year: string;
  region: string;
  distributor: string;
};

type Props = {
  filters: Filters;
};

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const resize = () => map.invalidateSize();
    setTimeout(resize, 200);
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [map]);

  return null;
}

export default function SalesMap({ filters }: Props) {
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();

    fetch(`/api/sales-by-city?${query}`)
      .then((res) => res.json())
      .then(setCities);
  }, [filters]);

  if (!cities.length)
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Cargando mapa...
      </div>
    );

  const maxSales = Math.max(...cities.map((c) => Number(c.total_sales)));
  const center: LatLngExpression = [18.7357, -70.1627];

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="h-full w-full"
      scrollWheelZoom={false}
    >
      <ResizeMap />

      {/* 🔹 Mapa Base en Modo Oscuro (CartoDB Dark Matter) */}
      <TileLayer 
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {cities.map((city, index) => {
        const sales = Number(city.total_sales);
        const radius = (sales / maxSales) * 35;

        const position: LatLngExpression = [
          Number(city.latitude),
          Number(city.longitude),
        ];

        return (
          <CircleMarker
            key={index}
            center={position}
            radius={radius}
            pathOptions={{
              color: "#3b82f6", // Azul vibrante para contraste
              fillColor: "#2563eb",
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              {/* Texto oscuro porque los popups de Leaflet son blancos por defecto */}
              <div className="text-gray-900 font-sans">
                <strong className="block mb-1 text-base">{city.city_name}</strong>
                <span>Ventas: RD$ {sales.toLocaleString()}</span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}