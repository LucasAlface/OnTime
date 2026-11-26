"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  Layer,
} from "@vis.gl/react-maplibre";
import { getCoordinates } from "@/services/location/Tracker";
import { getStops } from "@/components/stops/GetStops";
import RouteSidebar from "./RouteSidebar";

const MAPLIBRE_WORKER_URL = new URL(
  "maplibre-gl/dist/maplibre-gl-worker.mjs",
  import.meta.url,
).toString();

const MAP_STYLE = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    openstreetmap: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "openstreetmap", type: "raster", source: "openstreetmap" }],
};



export default function Map() {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busCoordinates, setBusCoordinates] = useState({});
  const [mapZoom, setMapZoom] = useState(12.8);
  const [stopSearch, setStopSearch] = useState("");
  const [isStopSearchOpen, setIsStopSearchOpen] = useState(false);
  const mapRef = useRef(null);

  const stopFeatures = {
    type: "FeatureCollection",
    features: stops.map((stop) => ({
      type: "Feature",
      properties: { code: stop.code, name: stop.name },
      geometry: {
        type: "Point",
        coordinates: [Number(stop.lon), Number(stop.lat)],
      },
    })),
  };

  const handleRoutesLoaded = useCallback((loadedRoutes) => {
    setRoutes(loadedRoutes);
  }, []);

  const toggleRoute = useCallback((line) => {
    if (selectedRoutes.includes(line)) {
      setSelectedBus((bus) => (bus?.line === line ? null : bus));
    }
    setSelectedRoutes((current) => {
      const isSelected = current.includes(line);
      if (isSelected) {
        return current.filter((selectedLine) => selectedLine !== line);
      }
      return [...current, line];
    });
  }, [selectedRoutes]);

  const clearRoutes = useCallback(() => {
    setSelectedRoutes([]);
    setSelectedBus(null);
  }, []);

  useEffect(() => {
    getStops()
      .then((databaseStops) => setStops(databaseStops))
      .catch((error) => console.error("Failed to load stops:", error));
  }, []);

  const getSelectedRoutes = () =>
    routes.filter((route) => selectedRoutes.includes(String(route.line)));

  const handleStopMapClick = (event) => {
    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.properties?.cluster_id !== undefined) {
      const source = event.target.getSource("stops-clustered");
      if (!source) return;

      source
        .getClusterExpansionZoom(Number(feature.properties.cluster_id))
        .then((zoom) => {
          event.target.easeTo({
            center: feature.geometry.coordinates,
            zoom,
            duration: 650,
          });
        })
        .catch((error) => {
          console.error("Failed to expand stop cluster:", error);
        });
      return;
    }

    const stop = stops.find((item) => item.code === feature.properties?.code);
    if (stop) setSelectedStop(stop);
  };

  const stopSearchResults = stopSearch.trim()
    ? stops
        .filter((stop) =>
          `${stop.name} ${stop.code}`
            .toLocaleLowerCase()
            .includes(stopSearch.trim().toLocaleLowerCase()),
        )
        .slice(0, 8)
    : [];

  const selectStopFromSearch = (stop) => {
    setSelectedBus(null);
    setSelectedStop(stop);
    setStopSearch(`${stop.name} (${stop.code})`);
    setIsStopSearchOpen(false);
    mapRef.current?.flyTo({
      center: [Number(stop.lon), Number(stop.lat)],
      zoom: Math.max(mapZoom, 16),
      duration: 800,
    });
  };

  useEffect(() => {
    const activeRoutes = getSelectedRoutes();
    const activeLines = new Set(activeRoutes.map((route) => String(route.line)));
    const controllers = activeRoutes.map(() => new AbortController());

    setBusCoordinates((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([, bus]) => activeLines.has(bus.line)),
      ),
    );

    activeRoutes.forEach((route, index) => {
      const line = String(route.line);
      getCoordinates((buses) => {
        setBusCoordinates((current) => {
          const next = { ...current };
          for (const bus of buses) {
            const [longitude, latitude] = bus.coordinates;
            if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
              next[bus.id] = { ...bus, longitude, latitude };
            }
          }
          return next;
        });
      }, line, controllers[index].signal).catch((error) => {
        if (!controllers[index].signal.aborted) {
          console.error(`Failed to update bus location for route ${line}:`, error);
        }
      });
    });

    return () => controllers.forEach((controller) => controller.abort());
  }, [routes, selectedRoutes]);
    

  return (
    <main className="stcp-map-page">
      <div className="stopSearch">
        <input
          type="search"
          value={stopSearch}
          onChange={(event) => {
            setStopSearch(event.target.value);
            setIsStopSearchOpen(true);
          }}
          onFocus={() => setIsStopSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsStopSearchOpen(false);
          }}
          placeholder="Pesquisar paragens por nome ou código"
          aria-label="Pesquisar paragens por nome ou código"
          aria-expanded={isStopSearchOpen && stopSearchResults.length > 0}
        />
        {isStopSearchOpen && stopSearch.trim() && (
          <ul className="stopSearchResults">
            {stopSearchResults.length > 0 ? stopSearchResults.map((stop) => (
              <li key={stop.code}>
                <button type="button" onClick={() => selectStopFromSearch(stop)}>
                  <span>{stop.name}</span>
                  <small>{stop.code}</small>
                </button>
              </li>
            )) : (
              <li className="stopSearchEmpty">Nenhuma paragem encontrada</li>
            )}
          </ul>
        )}
      </div>
      <RouteSidebar
        selectedRoutes={selectedRoutes}
        onToggleRoute={toggleRoute}
        onClearRoutes={clearRoutes}
        onRoutesLoaded={handleRoutesLoaded}
      />
      <div className="mapCanvas">
        <MapLibreMap
          ref={mapRef}
          initialViewState={{ longitude: -8.632, latitude: 41.163, zoom: 12.8 }}
          mapStyle={MAP_STYLE}
          workerUrl={MAPLIBRE_WORKER_URL}
          attributionControl
          interactiveLayerIds={["stop-clusters", "stop-points", "stop-labels"]}
          onClick={handleStopMapClick}
          onMoveEnd={(event) => setMapZoom(event.viewState.zoom)}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass />
          <ScaleControl position="bottom-right" />

          <Source
            id="stops-clustered"
            type="geojson"
            data={stopFeatures}
            cluster
            clusterMaxZoom={14}
            clusterRadius={48}
          >
            <Layer
  id="stop-clusters"
  type="circle"
  filter={["has", "point_count"]}
  paint={{
    "circle-color": "#075b7d",
    "circle-radius": [
      "step",
      ["get", "point_count"],
      16,
      20, 20,
      100, 25,
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 3,
  }}
/>

<Layer
  id="stop-cluster-count"
  type="symbol"
  filter={["has", "point_count"]}
  layout={{
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12,
  }}
  paint={{
    "text-color": "#ffffff",
  }}
/>

<Layer
  id="stop-points"
  type="circle"
  filter={["!", ["has", "point_count"]]}
  paint={{
    "circle-color": "#075b7d",
    "circle-radius": 9,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 3,
  }}
/>

<Layer
  id="stop-labels"
  type="symbol"
  filter={["!", ["has", "point_count"]]}
  layout={{
    "text-field": ["get", "name"],
    "text-size": 11,
    "text-offset": [0, 1.5],
    "text-anchor": "top",
  }}
  paint={{
    "text-color": "#163f53",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.5,
  }}
/>
          </Source>

          {Object.values(busCoordinates).map((bus) => (
            (() => {
              const routeName = routes.find((item) => String(item.line) === bus.line)?.name;
              const displayRouteName = bus.sentido === "1" && routeName?.includes("-")
                ? routeName.split("-").map((part) => part.trim()).reverse().join(" - ")
                : routeName;

              return (
                <Marker
                  key={bus.id}
                  longitude={bus.longitude}
                  latitude={bus.latitude}
                  anchor="center"
                >
                  <button
                    type="button"
                    className="busMarker"
                    aria-label={`Ver linha ${displayRouteName ?? bus.line}`}
                    title={displayRouteName ?? `Linha ${bus.line}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedBus({ ...bus, displayRouteName });
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 3h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2v1h-2v-1H7v1H5v-1a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v8h14V5H5Zm1 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm12 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                    </svg>
                  </button>
                </Marker>
              );
            })()
          ))}

          {selectedBus && (
            <Popup
              longitude={selectedBus.longitude}
              latitude={selectedBus.latitude}
              offset={20}
              closeButton
              closeOnClick={false}
              onClose={() => setSelectedBus(null)}
            >
              <strong>{selectedBus.line}</strong>
              {selectedBus.displayRouteName && (
                <span className="popupCoordinates">{selectedBus.displayRouteName}</span>
              )}
            </Popup>
          )}

          {selectedStop && (
            <Popup
              longitude={Number(selectedStop.lon)}
              latitude={Number(selectedStop.lat)}
              offset={32}
              closeButton
              closeOnClick={false}
              onClose={() => setSelectedStop(null)}
            >
              <strong>{selectedStop.name}</strong>
              <p className="popupStopCode">{selectedStop.code}</p>
              <p className="popupStopCode">
                Linhas: {selectedStop.routes?.map((relation) => relation.routeLine).join(", ") || "nenhuma"}
              </p>
            </Popup>
          )}
        </MapLibreMap>
      </div>
    </main>
  );
}
