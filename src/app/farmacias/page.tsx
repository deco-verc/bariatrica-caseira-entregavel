"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/openstreetmap";
import MapPlaceholder from "@/components/maps/MapPlaceholder";
import MapSearch from "@/components/maps/MapSearch";
import { Header } from "@/components/Header";

// Importação dinâmica do mapa para evitar erros de SSR (window/document undefined)
const MapView = dynamic(() => import("@/components/maps/MapView"), {
  ssr: false,
  loading: () => <MapPlaceholder isLoading />,
});

export default function FarmaciasPage() {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [selectedCity, setSelectedCity] = useState("");

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    setMapCenter([lat, lon]);
    setMapZoom(12);
    setSelectedCity(name);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header title="Farmácias de Manipulação" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna de Busca e Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="text-indigo-600" size={20} />
                Localização
              </h2>
              <MapSearch onSelectLocation={handleLocationSelect} />
              
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex gap-3">
                  <Info className="text-indigo-600 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-900">Em Breve</h3>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                      Estamos integrando as farmácias de manipulação parceiras. Em breve você poderá encontrar e solicitar sua fórmula diretamente pelo app.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-lg shadow-indigo-200">
              <h3 className="font-bold text-lg mb-2">Por que manipular?</h3>
              <ul className="text-sm space-y-2 opacity-90">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Doses personalizadas para seu corpo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Livre de conservantes desnecessários
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Melhor custo-benefício em fórmulas complexas
                </li>
              </ul>
            </div>
          </div>

          {/* Coluna do Mapa */}
          <div className="lg:col-span-8">
            <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden relative">
              {/* Header do Mapa Mobile */}
              <div className="absolute top-6 left-6 right-6 z-10 flex flex-col md:flex-row gap-4 pointer-events-none">
                {selectedCity && (
                  <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white flex items-center gap-2 pointer-events-auto self-start">
                    <MapPin size={14} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-700">Explorando {selectedCity.split(',')[0]}</span>
                  </div>
                )}
              </div>

              <div className="h-[500px] md:h-[650px] w-full">
                <MapView 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  height="100%"
                />
              </div>

              {/* Mensagem de Placeholder sobre o Mapa */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-100 text-center">
                  <p className="text-sm font-medium text-slate-800">
                    “Integração de farmácias será liberada em breve.”
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Você já pode explorar o mapa e buscar cidades.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
