/**
 * Configurações para o OpenStreetMap
 */
export const OSM_TILE_LAYER = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const DEFAULT_CENTER: [number, number] = [-14.2350, -51.9253]; // Centro do Brasil
export const DEFAULT_ZOOM = 4;

export const MAP_CONFIG = {
  tileLayer: OSM_TILE_LAYER,
  attribution: OSM_ATTRIBUTION,
  defaultCenter: DEFAULT_CENTER,
  defaultZoom: DEFAULT_ZOOM,
};
