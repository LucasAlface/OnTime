import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type BusLocation = {
    id: string;
    line: string;
    sentido: "0" | "1";
    coordinates: [number, number];
};

type BusEntity = {
    id: string;
    annotations: { value: string[] };
    location: { value: { coordinates: [number, number] } };
};

async function getRouteInfo(route: string) {
    const response = await axios.get(
        `https://broker.fiware.urbanplatform.portodigital.pt/v2/entities?q=vehicleType==bus;annotations==stcp:route:${route}`
    );
    return response.data;
}

export async function getRoutes() {
    const routes = await axios.get(`${API_URL}/route`);
    return routes.data;
} 

export async function getCoordinates(
    onUpdate: (buses: BusLocation[]) => void, route: string
) {
    const lastByVehicle = new Map<string, string>();

    while (true) {
        const requestStartedAt = Date.now();
        const entities: BusEntity[] = await getRouteInfo(route);
        const changedBuses: BusLocation[] = [];

        for (const bus of entities) {
            const routeAnnotation = bus.annotations.value.find((annotation) =>
                annotation.startsWith("stcp:route:"),
            );
            const directionAnnotation = bus.annotations.value.find((annotation) =>
                annotation.startsWith("stcp:sentido:"),
            );
            if (!routeAnnotation || !directionAnnotation) continue;

            const vehicle: BusLocation = {
                id: bus.id,
                line: routeAnnotation.slice("stcp:route:".length),
                sentido: directionAnnotation.slice("stcp:sentido:".length) as "0" | "1",
                coordinates: bus.location.value.coordinates,
            };
            const serializedVehicle = JSON.stringify(vehicle);

            if (lastByVehicle.get(bus.id) !== serializedVehicle) {
                changedBuses.push(vehicle);
                lastByVehicle.set(bus.id, serializedVehicle);
            }
        }

        if (changedBuses.length > 0) onUpdate(changedBuses);

        const elapsed = Date.now() - requestStartedAt;
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - elapsed)));
    }
}
