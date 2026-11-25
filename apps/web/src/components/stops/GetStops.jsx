import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getStops() {
    const stops = await axios.get(`${API_URL}/stop`)
    return stops.data;
}
