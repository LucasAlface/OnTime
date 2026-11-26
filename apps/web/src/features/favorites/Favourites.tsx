import axios from "axios";
import { getUser } from "@/services/api/User";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Favourite {
  userId: number;
  routeLine: string;
}

async function getAuthenticatedUserId() {
  const user = await getUser();
  if (typeof user?.id !== "number") {
    throw new Error("The authenticated user ID is unavailable.");
  }

  return user.id;
}

export async function getFavorites(): Promise<Favourite[]> {
  const userId = await getAuthenticatedUserId();
  const response = await axios.get<Favourite[]>(`${API_URL}/favourites`, {
    withCredentials: true,
  });

  return response.data.filter((favourite) => favourite.userId === userId);
}

export async function addFavorite(routeLine: string) {
  const userId = await getAuthenticatedUserId();
  const response = await axios.post(
    `${API_URL}/favourites/create`,
    { userId, routeLine },
    { withCredentials: true },
  );

  return response.data;
}

export async function removeFavourite(routeLine: string) {
  const userId = await getAuthenticatedUserId();
  const response = await axios.post(
    `${API_URL}/favourites/delete/${userId}/${encodeURIComponent(routeLine)}`,
    {},
    { withCredentials: true },
  );

  return response.data;
}
