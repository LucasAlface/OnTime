import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getRouteInfo(route: string) {
    const response = await axios.get(
        `https://broker.fiware.urbanplatform.portodigital.pt/v2/entities?q=vehicleType==bus;annotations==stcp:route:${route}&limit=1`
    );
    return response.data;
}

export async function getRoutes() {
    const routes = await axios.get(`${API_URL}/route`);
    return routes.data;
} 

export async function getCoordinates(
    onUpdate: (coordinates: any[]) => void, route: string
) {
    let lastCoordinates: string | undefined;

    while (true) {
        const requestStartedAt = Date.now();
        const entities = await getRouteInfo(route);
        let coordinates: any[] = [];
        entities.forEach((bus: { location: { value: { coordinates: any; }; }; }) => {
            coordinates.push(bus.location.value.coordinates);
        });

        const serializedCoordinates = JSON.stringify(coordinates);
        if (serializedCoordinates !== lastCoordinates) {
            onUpdate(coordinates);
            lastCoordinates = serializedCoordinates;
        }

        const elapsed = Date.now() - requestStartedAt;
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - elapsed)));
    }
}