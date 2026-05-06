"use client";

import { MapPin, RefreshCw } from "lucide-react";

interface MapPlaceholderProps {
  error?: boolean;
  onRetry?: () => void;
  isLoading?: boolean;
}

export default function MapPlaceholder({ error, onRetry, isLoading }: MapPlaceholderProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-pulse">
      {error ? (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Não foi possível carregar o mapa</h3>
          <p className="text-slate-500 mb-6 max-w-xs">
            Verifique sua conexão com a internet e tente novamente.
          </p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium shadow-md"
          >
            <RefreshCw size={18} />
            Tentar novamente
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-4 relative">
            <MapPin size={32} className={isLoading ? "animate-bounce" : ""} />
            {isLoading && (
              <span className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin"></span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {isLoading ? "Carregando mapa..." : "Preparando mapa..."}
          </h3>
          <p className="text-slate-400 max-w-xs text-sm">
            Estamos preparando a visualização das farmácias parceiras.
          </p>
        </>
      )}
    </div>
  );
}
