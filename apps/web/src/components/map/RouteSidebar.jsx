"use client";

import { useEffect, useState } from "react";
import {
  addFavorite,
  getFavorites,
  removeFavourite,
} from "@/features/favorites/Favourites";
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
  const [favoriteLines, setFavoriteLines] = useState(() => new Set());
  const [pendingFavoriteLines, setPendingFavoriteLines] = useState(() => new Set());
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);

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

  useEffect(() => {
    let active = true;

    getFavorites()
      .then((favourites) => {
        if (active) {
          setFavoriteLines(new Set(favourites.map((favourite) => String(favourite.routeLine))));
          setFavoritesReady(true);
        }
      })
      .catch((loadError) => {
        if (active) {
          console.error("Failed to load favourites:", loadError);
          setFavoriteError("Inicia sessão para gerir os favoritos.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleFavorite = async (line) => {
    if (pendingFavoriteLines.has(line)) return;

    setPendingFavoriteLines((current) => new Set(current).add(line));
    setFavoriteError(null);

    try {
      if (favoriteLines.has(line)) {
        await removeFavourite(line);
        setFavoriteLines((current) => {
          const next = new Set(current);
          next.delete(line);
          return next;
        });
      } else {
        await addFavorite(line);
        setFavoriteLines((current) => new Set(current).add(line));
      }
    } catch (toggleError) {
      console.error(`Failed to update favourite for route ${line}:`, toggleError);
      setFavoriteError("Não foi possível atualizar os favoritos.");
    } finally {
      setPendingFavoriteLines((current) => {
        const next = new Set(current);
        next.delete(line);
        return next;
      });
    }
  };

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleRoutes = [
    ...(normalizedSearch
      ? routes.filter((route) =>
          `${route.line} ${route.name ?? ""}`.toLocaleLowerCase().includes(normalizedSearch),
        )
      : routes),
  ].sort(
    (a, b) =>
      Number(favoriteLines.has(String(b.line))) -
      Number(favoriteLines.has(String(a.line))),
  );

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
      {favoriteError && <p className="routeSidebarError">{favoriteError}</p>}
      <ul>
        {visibleRoutes.map((route) => {
          const line = String(route.line);
          const isFavorite = favoriteLines.has(line);
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
              <button
                className={`routeSidebarFavorite${isFavorite ? " isFavorite" : ""}`}
                type="button"
                onClick={() => toggleFavorite(line)}
                disabled={!favoritesReady || pendingFavoriteLines.has(line)}
                aria-label={isFavorite ? `Remover linha ${line} dos favoritos` : `Adicionar linha ${line} aos favoritos`}
                aria-pressed={isFavorite}
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                {isFavorite ? "★" : "☆"}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
