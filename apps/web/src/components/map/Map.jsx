"use client";

import { useEffect, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
} from "@vis.gl/react-maplibre";
import { getCoordinates, getRoutes } from "@/services/location/Tracker";
import { getStops } from "@/components/stops/GetStops";

const ROUTES = await getRoutes();

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
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busCoordinates, setBusCoordinates] = useState({});

  useEffect(() => {
    getStops()
      .then((databaseStops) => setStops(databaseStops))
      .catch((error) => console.error("Failed to load stops:", error));
  }, []);

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

          {stops.map((stop) => (
            <Marker
              key={stop.code}
              longitude={Number(stop.lon)}
              latitude={Number(stop.lat)}
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
                <span className="stopPin"></span>
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
