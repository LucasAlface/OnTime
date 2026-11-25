"use client";

import { useEffect, useState } from "react";
import {
  Layer,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from "@vis.gl/react-maplibre";
import { getCoordinates, getRoutes } from "@/services/location/Tracker";

const STOPS = [
  { id: "aliados", name: "Aliados", latitude: 41.148944, longitude: -8.611278 },
  {
    id: "galiza",
    name: "Pr. da Galiza",
    latitude: 41.153444,
    longitude: -8.626333,
  },
  {
    id: "casa-da-musica",
    name: "Casa da Música",
    latitude: 41.15895,
    longitude: -8.62942,
  },
  {
    id: "fonte-da-moura",
    name: "Fonte da Moura",
    latitude: 41.171022,
    longitude: -8.657982,
  },
  { id: "viso", name: "Viso", latitude: 41.17784, longitude: -8.64228 },
];

const ROUTES = await getRoutes();

const APPROXIMATE_ROUTE = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: STOPS.map(({ longitude, latitude }) => [longitude, latitude]),
  },
};

const ROUTE_URL = `https://router.project-osrm.org/route/v1/driving/${STOPS.map(
  ({ longitude, latitude }) => `${longitude},${latitude}`,
).join(";")}?overview=full&geometries=geojson&steps=false`;

const MAP_STYLE = {
  version: 8,
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
  const [route, setRoute] = useState(APPROXIMATE_ROUTE);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeStatus, setRouteStatus] = useState("loading");
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busCoordinates, setBusCoordinates] = useState({});

  useEffect(() => {
    ROUTES.forEach(({ line }) => {
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
      }, line).catch((error) => {
        console.error(`Failed to update bus location for route ${line}:`, error);
      });
    });
  }, []);
    

  useEffect(() => {
    const controller = new AbortController();

    async function loadFastestRoute() {
      try {
        const response = await fetch(ROUTE_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("Route request failed");

        const result = await response.json();
        const fastestRoute = result.routes?.[0];
        if (!fastestRoute?.geometry?.coordinates?.length) {
          throw new Error("No route was returned");
        }

        setRoute({
          type: "Feature",
          properties: {},
          geometry: fastestRoute.geometry,
        });
        setRouteDuration(Math.round(fastestRoute.duration / 60));
        setRouteStatus("ready");
      } catch {
        if (!controller.signal.aborted) setRouteStatus("approximate");
      }
    }

    loadFastestRoute();
    return () => controller.abort();
  }, []);

  const routeMessage =
    routeStatus === "loading"
      ? "A calcular o percurso mais rápido…"
      : routeStatus === "approximate"
        ? "Percurso aproximado · serviço de direções indisponível"
        : "Percurso rodoviário mais rápido";

  return (
    <main className="stcp-map-page">
      <div className="mapCanvas">
        <MapLibreMap
          initialViewState={{ longitude: -8.632, latitude: 41.163, zoom: 12.8 }}
          mapStyle={MAP_STYLE}
          attributionControl
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass />
          <ScaleControl position="bottom-right" />

          <Source id="fastest-route" type="geojson" data={route}>
            <Layer
              id="fastest-route-outline"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#ffffff", "line-width": 10, "line-opacity": 0.9 }}
            />
            <Layer
              id="fastest-route-line"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#1976e9", "line-width": 5, "line-opacity": 0.98 }}
            />
          </Source>

          {STOPS.map((stop, index) => (
            <Marker
              key={stop.id}
              longitude={stop.longitude}
              latitude={stop.latitude}
              anchor="bottom"
            >
              <button
                type="button"
                className="stopMarker"
                aria-label={`Ver paragem ${stop.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedStop(stop);
                }}
              >
                <span className="stopPin">{index + 1}</span>
                <span className="stopLabel">{stop.name}</span>
              </button>
            </Marker>
          ))}

          {Object.values(busCoordinates).map((bus) => (
            (() => {
              const routeName = ROUTES.find((item) => String(item.line) === bus.line)?.name;
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
              longitude={selectedStop.longitude}
              latitude={selectedStop.latitude}
              offset={32}
              closeButton
              closeOnClick={false}
              onClose={() => setSelectedStop(null)}
            >
              <strong>{selectedStop.name}</strong>
              <span className="popupCoordinates">
                {selectedStop.latitude.toFixed(6)}, {selectedStop.longitude.toFixed(6)}
              </span>
            </Popup>
          )}
        </MapLibreMap>
      </div>

      <section className="infoPanel" aria-label="Informação do mapa STCP">
        <header className="header">
          <a className="brand" href="/" aria-label="OnTime — início">
            <span className="brandMark" aria-hidden="true">
              <span />
            </span>
            <span>OnTime</span>
          </a>
          <span className="cityTag">PORTO, PORTUGAL</span>
        </header>

        <div className="intro">
          <p className="eyebrow">REDE STCP</p>
          <h1>Porto em movimento</h1>
          <p className="description">Paragens e percurso numa só vista.</p>
        </div>

        <div className="routeCard">
          <div className="routeHeading">
            <span className="routeIcon" aria-hidden="true" />
            <div>
              <strong>Percurso mais rápido</strong>
              <small>{routeMessage}</small>
            </div>
            {routeDuration !== null && routeStatus === "ready" && (
              <span className="duration">{routeDuration} min</span>
            )}
          </div>
          <div className="routeLegend">
            <span className="routeSwatch" />
            <span>Entre as 5 paragens · estrada</span>
          </div>
        </div>

        <ol className="stopList">
          {STOPS.map((stop, index) => (
            <li key={stop.id}>
              <span className="listIndex">{String(index + 1).padStart(2, "0")}</span>
              <span>{stop.name}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
