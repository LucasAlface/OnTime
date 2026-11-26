"use client";

import { useEffect, useState } from "react";
import { getRoutes } from "@/services/location/Tracker";

export default function RouteSidebar({ selectedRoutes, onToggleRoute, onRoutesLoaded }) {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    getRoutes()
      .then((result) => {
        if (!active) return;
        const sortedRoutes = [...result].sort(
          (a, b) => Number(a.sort_order) - Number(b.sort_order),
        );
        setRoutes(sortedRoutes);
        onRoutesLoaded(sortedRoutes);
      })
      .catch((loadError) => {
        if (active) {
          console.error("Failed to load routes:", loadError);
          setError("Não foi possível carregar as linhas.");
        }
      });

    return () => {
      active = false;
    };
  }, [onRoutesLoaded]);

  return (
    <aside className="routeSidebar" aria-label="Linhas STCP">
      <h2>Linhas</h2>
      {error && <p className="routeSidebarError">{error}</p>}
      {!error && routes.length === 0 && <p className="routeSidebarLoading">A carregar linhas…</p>}
      <ul>
        {routes.map((route) => {
          const line = String(route.line);
          return (
            <li key={line}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedRoutes.includes(line)}
                  onChange={() => onToggleRoute(line)}
                />
                <span className="routeSidebarLine">{line}</span>
                {route.name && <span className="routeSidebarName">{route.name}</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
