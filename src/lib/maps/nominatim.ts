/**
 * Serviço de Geocoding usando Nominatim (OpenStreetMap)
 * 
 * ATENÇÃO:
 * - O serviço Nominatim possui uma política de uso limitado (1 request por segundo).
 * - Não use para alto volume sem cache.
 * - Sempre use debounce nas buscas para evitar bloqueios por excesso de requisições.
 */

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Busca uma cidade ou endereço
 */
export async function searchLocation(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const url = new URL(NOMINATIM_BASE_URL);
    url.searchParams.append("q", query);
    url.searchParams.append("format", "json");
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("limit", "5");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "BariatricaCaseira/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Erro na busca do Nominatim");
    }

    return await response.ok ? await response.json() : [];
  } catch (error) {
    console.error("Erro ao buscar no Nominatim:", error);
    return [];
  }
}

/**
 * Geocoding Reverso (Lat/Lng -> Endereço)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<NominatimResult | null> {
  try {
    const url = new URL(NOMINATIM_REVERSE_URL);
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lon", lng.toString());
    url.searchParams.append("format", "json");
    url.searchParams.append("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "BariatricaCaseira/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Erro no reverse geocode do Nominatim");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no reverse geocode:", error);
    return null;
  }
}
