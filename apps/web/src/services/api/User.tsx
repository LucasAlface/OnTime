import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUser() {
  const response = await axios.get(`${API_URL}/auth/me`, {
    withCredentials: true,
  });

  return response.data;
}
