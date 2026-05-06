"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OSM_TILE_LAYER, OSM_ATTRIBUTION } from "@/lib/maps/openstreetmap";

// Correção para ícones do Leaflet no Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

interface MapMarker {
  id: string | number;
  position: [number, number];
  title: string;
  description?: string;
}

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  height?: string;
}

// Componente para atualizar o centro do mapa quando a prop center mudar
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ center, zoom, markers = [], height = "400px" }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fixLeafletIcons();
  }, []);

  if (!isClient) {
    return null; // O Dynamic import vai cuidar disso, mas por segurança...
  }

  return (
    <div className="w-full relative overflow-hidden rounded-2xl shadow-inner border border-slate-100" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <ChangeView center={center} zoom={zoom} />
        
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url={OSM_TILE_LAYER}
        />

        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup className="premium-popup">
              <div className="p-1">
                <h3 className="font-bold text-slate-900">{marker.title}</h3>
                {marker.description && <p className="text-sm text-slate-600 mt-1">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay opcional para estética */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-2xl"></div>
    </div>
  );
}
