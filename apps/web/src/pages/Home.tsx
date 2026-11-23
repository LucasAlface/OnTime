"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getUser } from "../services/api/User";

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch((error) => {
        console.error("Failed to get user:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>Not logged in</p>;

  return (
    <Map />
  );
}
