"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchLocation, NominatimResult } from "@/lib/maps/nominatim";
import { useDebounce } from "@/hooks/use-debounce"; // Vou precisar criar/verificar se existe

interface MapSearchProps {
  onSelectLocation: (lat: number, lon: number, name: string) => void;
}

export default function MapSearch({ onSelectLocation }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 800);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      const performSearch = async () => {
        setIsLoading(true);
        try {
          const data = await searchLocation(debouncedQuery);
          setResults(data);
          setIsOpen(data.length > 0);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      };
      performSearch();
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const onSelect = (res: NominatimResult) => {
    onSelectLocation(parseFloat(res.lat), parseFloat(res.lon), res.display_name);
    setQuery(res.display_name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 size={18} className="text-indigo-500 animate-spin" />
          ) : (
            <Search size={18} className="text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length < 3) setIsOpen(false);
          }}
          onFocus={() => query.length >= 3 && results.length > 0 && setIsOpen(true)}
          placeholder="Digite sua cidade ou estado..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Resultados da Busca */}
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-[1000] overflow-hidden">
          <div className="py-2 max-h-64 overflow-y-auto">
            {results.map((res) => (
              <button
                key={res.place_id}
                onClick={() => onSelect(res)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
              >
                <MapPin size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-800 text-sm line-clamp-1">{res.display_name}</div>
                  {res.address?.state && (
                    <div className="text-xs text-slate-400">{res.address.state}, {res.address.country}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
