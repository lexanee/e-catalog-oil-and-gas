import React, { useState, useEffect, useRef } from "react";
import { Asset, Shorebase } from "../../../types";
import { useAssets } from "../../../context/AssetContext";
import { useTheme } from "../../../context/ThemeContext";
import L from "leaflet";
import { RefreshCw, Focus, Crosshair, AlertOctagon } from "lucide-react";

interface AssetMapProps {
  assets?: Asset[];
  shorebases?: Shorebase[];
  singleAsset?: Asset;
  height?: string;
  zoomLevel?: "region" | "local";
  selectedAssetId?: string | null;
  onAssetClick?: (assetId: string) => void;
  visibleCategories?: string[];
  showHeatmap?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  spatialFilter?: { lat: number; lng: number; radius: number } | null;
  showZones?: boolean;
  showWK?: boolean;
  showLogistics?: boolean;
}

const wilayahKerjaData = [
  {
    id: "wk1",
    name: "WK Rokan",
    color: "#f59e0b",
    coords: [
      [1.5, 100.5],
      [2.0, 101.5],
      [1.0, 102.0],
      [0.5, 101.0],
    ],
  },
  {
    id: "wk2",
    name: "WK Mahakam",
    color: "#10b981",
    coords: [
      [-0.5, 117.0],
      [-1.0, 117.5],
      [-1.5, 117.0],
      [-1.0, 116.5],
    ],
  },
  {
    id: "wk3",
    name: "WK Natuna",
    color: "#3b82f6",
    coords: [
      [4.0, 107.5],
      [5.0, 108.5],
      [4.5, 109.0],
      [3.5, 108.0],
    ],
  },
];

const AssetMap: React.FC<AssetMapProps> = ({
  assets,
  shorebases = [],
  singleAsset,
  height = "h-96",
  zoomLevel = "region",
  selectedAssetId,
  onAssetClick,
  visibleCategories,
  showHeatmap = false,
  onMapClick,
  spatialFilter,
  showZones = true,
  showWK = true,
  showLogistics = false,
}) => {
  const { zones, notifications } = useAssets();
  const { theme } = useTheme();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylinesRef = useRef<{ [key: string]: L.Polyline }>({});
  const logisticsLinesRef = useRef<L.Polyline[]>([]);

  // Layer Refs
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const wkLayerRef = useRef<L.LayerGroup | null>(null);
  const weatherLayerRef = useRef<L.LayerGroup | null>(null);
  const spatialLayerRef = useRef<L.LayerGroup | null>(null);
  const shorebaseLayerRef = useRef<L.LayerGroup | null>(null);

  const hasWeatherAlert = notifications.some(
    (n) => n.type === "warning" && n.title.includes("WEATHER")
  );

  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (tileLayerRef.current) {
      const lightTiles =
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      const darkTiles =
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      tileLayerRef.current.setUrl(theme === "dark" ? darkTiles : lightTiles);
    }
  }, [theme]);

  useEffect(() => {
    let result = assets || [];
    if (singleAsset) {
      result = [singleAsset];
    } else if (visibleCategories && visibleCategories.length > 0) {
      result = result.filter((a) => visibleCategories.includes(a.category));
    }
    if (spatialFilter && !singleAsset) {
      result = result.filter((a) => {
        const dist = getDistance(
          spatialFilter.lat,
          spatialFilter.lng,
          a.coordinates.lat,
          a.coordinates.lng
        );
        return dist <= spatialFilter.radius;
      });
    }
    setFilteredAssets(result);
  }, [assets, singleAsset, visibleCategories, spatialFilter]);

  // Init Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Fix: Handle React Strict Mode double-mount by cleaning up potential residual Leaflet props
    const container = mapContainerRef.current as any;
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    // Default View
    map.setView([-2.5, 118.0], 5);

    const lightTiles =
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const darkTiles =
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    const tiles = L.tileLayer(theme === "dark" ? darkTiles : lightTiles, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    tileLayerRef.current = tiles;
    mapInstanceRef.current = map;

    // Initialize layers
    zonesLayerRef.current = L.layerGroup().addTo(map);
    wkLayerRef.current = L.layerGroup().addTo(map);
    weatherLayerRef.current = L.layerGroup().addTo(map);
    spatialLayerRef.current = L.layerGroup().addTo(map);
    shorebaseLayerRef.current = L.layerGroup().addTo(map);

    // Set Ready State to trigger other effects
    setIsMapReady(true);

    map.on("move", () => {
      if (!mapInstanceRef.current) return;
      // We only update tooltip position if we have a hovered asset
      // This prevents excessive updates
      setHoveredAsset((prev) => {
        if (prev) {
          try {
            const point = mapInstanceRef.current?.latLngToContainerPoint([
              prev.coordinates.lat,
              prev.coordinates.lng,
            ]);
            if (point) setTooltipPos(point);
          } catch (e) {
            /* ignore projection errors during drag */
          }
        }
        return prev;
      });
    });

    map.on("click", (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Cleanup function
    return () => {
      setIsMapReady(false); // Stop other effects
      if (mapInstanceRef.current) {
        // Clear all layers safely
        zonesLayerRef.current?.clearLayers();
        wkLayerRef.current?.clearLayers();
        weatherLayerRef.current?.clearLayers();
        spatialLayerRef.current?.clearLayers();
        shorebaseLayerRef.current?.clearLayers();

        Object.values(markersRef.current).forEach((m: any) => m.remove());
        markersRef.current = {};

        Object.values(polylinesRef.current).forEach((p: any) => p.remove());
        polylinesRef.current = {};

        logisticsLinesRef.current.forEach((l: any) => l.remove());
        logisticsLinesRef.current = [];

        // Remove map
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;

        // Final DOM cleanup
        if (mapContainerRef.current) {
          const c = mapContainerRef.current as any;
          c._leaflet_id = null;
        }
      }
    };
  }, []); // Run once on mount

  // Logistics Layer
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !shorebaseLayerRef.current)
      return;

    shorebaseLayerRef.current.clearLayers();

    // Clear old lines
    logisticsLinesRef.current.forEach((line) => line.remove());
    logisticsLinesRef.current = [];

    if (showLogistics && shorebases.length > 0) {
      shorebases.forEach((sb) => {
        const iconHtml = `
             <div class="relative flex items-center justify-center w-8 h-8 bg-slate-900 dark:bg-white rounded-lg shadow-sm border border-white dark:border-slate-900 transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white dark:text-slate-900"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>
             </div>
           `;
        const icon = L.divIcon({
          className: "custom-marker",
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        const marker = L.marker([sb.coordinates.lat, sb.coordinates.lng], {
          icon,
        });
        marker.bindPopup(
          `
          <div class="p-1">
            <div class="font-bold text-sm mb-1">${sb.name}</div>
            <div class="text-xs text-slate-500 mb-2">${sb.location}</div>
            <div class="flex flex-col gap-1 border-t border-slate-100 pt-2">
              <span class="text-[10px] font-bold uppercase tracking-wider ${
                sb.type === "KKKS" ? "text-emerald-600" : "text-amber-600"
              }">
                ${sb.type === "KKKS" ? "Milik KKKS" : "Base Umum"}
              </span>
              <span class="text-xs font-medium text-slate-700">
                ${sb.owner}
              </span>
            </div>
          </div>
          `,
          {
            closeButton: false,
            className: "custom-popup",
          }
        );
        marker.addTo(shorebaseLayerRef.current!);
      });

      if (selectedAssetId) {
        const asset = filteredAssets.find((a) => a.id === selectedAssetId);
        if (asset) {
          let nearest = null;
          let minDist = Infinity;
          shorebases.forEach((sb) => {
            const d = getDistance(
              asset.coordinates.lat,
              asset.coordinates.lng,
              sb.coordinates.lat,
              sb.coordinates.lng
            );
            if (d < minDist) {
              minDist = d;
              nearest = sb;
            }
          });

          if (nearest) {
            const line = L.polyline(
              [
                [asset.coordinates.lat, asset.coordinates.lng],
                [nearest.coordinates.lat, nearest.coordinates.lng],
              ],
              { color: "#64748b", weight: 1.5, dashArray: "4, 8", opacity: 0.6 }
            ).addTo(mapInstanceRef.current);
            logisticsLinesRef.current.push(line);
          }
        }
      }
    }
  }, [isMapReady, showLogistics, shorebases, selectedAssetId, filteredAssets]);

  // Weather & Heatmap
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !weatherLayerRef.current)
      return;

    weatherLayerRef.current.clearLayers();
    if (hasWeatherAlert) {
      L.circle([4.8, 108.0], {
        radius: 150000,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.2,
        weight: 1,
        dashArray: "10, 5",
      }).addTo(weatherLayerRef.current);
    } else if (showHeatmap) {
      filteredAssets.forEach((asset) => {
        L.circle([asset.coordinates.lat, asset.coordinates.lng], {
          radius: 60000,
          fillColor: "#0ea5e9",
          fillOpacity: 0.05,
          color: "transparent",
          interactive: false,
        }).addTo(weatherLayerRef.current!);
      });
    }
  }, [isMapReady, hasWeatherAlert, showHeatmap, filteredAssets]);

  // Zones & WK
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    if (zonesLayerRef.current) {
      zonesLayerRef.current.clearLayers();
      if (showZones) {
        zones.forEach((zone) => {
          L.circle([zone.coordinates.lat, zone.coordinates.lng], {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.05,
            radius: zone.radius,
            weight: 1,
            dashArray: "4, 4",
          }).addTo(zonesLayerRef.current!);
        });
      }
    }
    if (wkLayerRef.current) {
      wkLayerRef.current.clearLayers();
      if (showWK) {
        wilayahKerjaData.forEach((wk) => {
          L.polygon(wk.coords as any, {
            color: wk.color,
            weight: 1,
            fillColor: wk.color,
            fillOpacity: 0.1,
            dashArray: "4, 4",
          }).addTo(wkLayerRef.current!);
        });
      }
    }
  }, [isMapReady, showZones, showWK, zones]);

  // Spatial Filter
  useEffect(() => {
    if (!isMapReady || !spatialLayerRef.current) return;

    spatialLayerRef.current.clearLayers();
    if (spatialFilter) {
      L.circle([spatialFilter.lat, spatialFilter.lng], {
        radius: spatialFilter.radius * 1000,
        color: "#6366f1",
        weight: 1.5,
        fillColor: "#6366f1",
        fillOpacity: 0.05,
        dashArray: "4, 4",
      }).addTo(spatialLayerRef.current);
    }
  }, [isMapReady, spatialFilter]);

  // Markers & Asset Updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map) return;

    if (singleAsset) {
      map.setView(
        [singleAsset.coordinates.lat, singleAsset.coordinates.lng],
        zoomLevel === "local" ? 12 : 6
      );
    }

    // Sync Markers
    const activeIds = new Set(filteredAssets.map((a) => a.id));

    // Remove old
    Object.keys(markersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
        if (polylinesRef.current[id]) {
          polylinesRef.current[id].remove();
          delete polylinesRef.current[id];
        }
      }
    });

    // Add/Update new
    filteredAssets.forEach((asset) => {
      let marker = markersRef.current[asset.id];
      let polyline = polylinesRef.current[asset.id];
      const isSelected = selectedAssetId === asset.id;

      const getIconColor = (cat: string) => {
        if (cat === "Onshore Rig")
          return "text-indigo-600 bg-indigo-50 border-indigo-200";
        if (cat === "Offshore Rig")
          return "text-sky-600 bg-sky-50 border-sky-200";
        return "text-orange-600 bg-orange-50 border-orange-200";
      };

      const getIconSvg = (cat: string) => {
        if (cat === "Kapal")
          return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg)"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>';
        if (cat === "Offshore Rig")
          return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
      };

      const styleClass = getIconColor(asset.category);
      const iconSvg = getIconSvg(asset.category);

      const isCritical =
        (asset.health !== undefined && asset.health < 60) ||
        asset.status === "Verification"; // Simulate critical for demo

      const iconHtml = `
        <div class="relative group transition-transform duration-300 ${
          isSelected ? "scale-125 z-50" : "hover:scale-110 z-10"
        }">
          ${
            isCritical
              ? '<div class="absolute -inset-2 bg-rose-500 rounded-full animate-map-pulse opacity-50"></div>'
              : ""
          }
          <div class="w-8 h-8 rounded-full ${styleClass} flex items-center justify-center border shadow-sm relative z-10 bg-white">
            ${iconSvg}
          </div>
          ${
            asset.status === "Active"
              ? '<span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span></span>'
              : ""
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!marker) {
        marker = L.marker([asset.coordinates.lat, asset.coordinates.lng], {
          icon: customIcon,
        }).addTo(map);
        marker.on("click", () => onAssetClick && onAssetClick(asset.id));
        marker.on("mouseover", () => {
          // Direct DOM check to prevent error if map destroyed
          if (mapContainerRef.current) setHoveredAsset(asset);
        });
        marker.on("mouseout", () => setHoveredAsset(null));
        markersRef.current[asset.id] = marker;
      } else {
        marker.setLatLng([asset.coordinates.lat, asset.coordinates.lng]);
        marker.setIcon(customIcon);
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      }

      // Update history trail
      if (!singleAsset && asset.history.length > 1) {
        if (!polyline) {
          polyline = L.polyline(asset.history, {
            color:
              asset.category === "Onshore Rig"
                ? "#6366f1"
                : asset.category === "Offshore Rig"
                ? "#0ea5e9"
                : "#f97316",
            weight: 1.5,
            opacity: 0.4,
            dashArray: "3, 3",
          }).addTo(map);
          polylinesRef.current[asset.id] = polyline;
        } else {
          polyline.setLatLngs(asset.history);
        }
      }
    });
  }, [
    isMapReady,
    filteredAssets,
    singleAsset,
    zoomLevel,
    zones,
    selectedAssetId,
    onAssetClick,
    theme,
  ]);

  const fitBounds = () => {
    if (mapInstanceRef.current && filteredAssets.length > 0) {
      const group = new L.FeatureGroup(
        filteredAssets.map((a) =>
          L.marker([a.coordinates.lat, a.coordinates.lng])
        )
      );
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <div
      className={`relative w-full ${height} bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group`}
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-950"
      />

      {hasWeatherAlert && !singleAsset && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-rose-600 text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 animate-pulse">
          <AlertOctagon size={16} />
          <span className="font-bold text-xs uppercase tracking-wide">
            Protocol: Red-Natuna
          </span>
        </div>
      )}

      {spatialFilter && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[400] opacity-0 animate-fade-in">
          <Crosshair size={32} className="text-indigo-500 opacity-50" />
        </div>
      )}

      <div className="absolute right-4 top-4 z-[400] flex flex-col gap-2">
        {!singleAsset && (
          <button
            onClick={fitBounds}
            className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors"
            title="Fit to Results"
          >
            <Focus size={16} />
          </button>
        )}
      </div>

      {hoveredAsset && tooltipPos && (
        <div
          className="absolute z-[1000] pointer-events-none bg-white dark:bg-slate-900 px-3 py-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs transform -translate-x-1/2 -translate-y-full mt-[-10px] animate-fade-in"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 15 }}
        >
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {hoveredAsset.name}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {hoveredAsset.category}
          </p>
        </div>
      )}

      {!singleAsset && (
        <div className="absolute bottom-4 left-4 z-[400] bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-sm">
          <RefreshCw size={10} className="animate-spin-slow" />
          Live Sync
        </div>
      )}
    </div>
  );
};

export default AssetMap;
