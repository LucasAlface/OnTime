"use client";

import { useEffect, useState } from "react";
import { getUser } from "../services/api/User";

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
    <main className="home-page">
      <h1>Home</h1>
      <p>Welcome, {user.name}!</p>
    </main>
  );
}
