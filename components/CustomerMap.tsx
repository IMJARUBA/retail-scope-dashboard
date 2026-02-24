"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);
  return null;
}

export default function CustomerMap({ filters }: any) {
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const query = new URLSearchParams(filters).toString();
    fetch(`/api/customer-map?${query}`)
      .then(res => res.json())
      .then(setCities);
  }, [filters]);

  if (!cities.length) return <div className="h-full flex items-center justify-center text-gray-500">Cargando mapa...</div>;

  const maxCustomers = Math.max(...cities.map(c => Number(c.total_customers)));
  const center: LatLngExpression = [18.7357, -70.1627];

  return (
    <div className="h-full w-full">
      <MapContainer center={center} zoom={7} scrollWheelZoom={false} className="h-full w-full">
        <ResizeMap />
        
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {cities.map((city, i) => {
          const radius = (Number(city.total_customers) / maxCustomers) * 35;
          return (
            <CircleMarker
              key={i}
              center={[Number(city.latitude), Number(city.longitude)]}
              radius={radius}
              pathOptions={{ color: "#10b981", fillColor: "#059669", fillOpacity: 0.6, weight: 2 }}
            >
              <Popup>
                <div className="text-gray-900 font-sans">
                  <strong className="block mb-1 text-base">{city.city_name}</strong>
                  <span>Clientes: {Number(city.total_customers).toLocaleString()}</span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}