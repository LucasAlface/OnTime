"use client";

import { useEffect, useState } from "react";
import { getRoutes } from "@/services/location/Tracker";

export default function RouteSidebar({
  selectedRoutes,
  onToggleRoute,
  onClearRoutes,
  onRoutesLoaded,
}) {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");
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

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleRoutes = normalizedSearch
    ? routes.filter((route) =>
        `${route.line} ${route.name ?? ""}`.toLocaleLowerCase().includes(normalizedSearch),
      )
    : routes;

  return (
    <aside className="routeSidebar" aria-label="Linhas STCP">
      <div className="routeSidebarHeader">
        <h2>Linhas</h2>
      </div>
      <input
        className="routeSidebarSearch"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Pesquisar linhas"
        aria-label="Pesquisar linhas por código ou nome"
      />
      <div className="routeSidebarActions">
        <button
          className="routeSidebarClear"
          type="button"
          onClick={onClearRoutes}
          disabled={selectedRoutes.length === 0}
          aria-label="Limpar linhas selecionadas"
        >
          Limpar
        </button>
      </div>
      {error && <p className="routeSidebarError">{error}</p>}
      {!error && routes.length === 0 && <p className="routeSidebarLoading">A carregar linhas…</p>}
      <ul>
        {visibleRoutes.map((route) => {
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
