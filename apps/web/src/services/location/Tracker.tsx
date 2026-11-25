import axios from "axios";

async function get204() {
    const response = await axios.get(
        "https://broker.fiware.urbanplatform.portodigital.pt/v2/entities?q=vehicleType==bus;annotations==stcp:route:204"
    );
    return response.data;
}

export async function getCoordinates(
    onUpdate: (coordinates: any[]) => void
) {
    let lastCoordinates: string | undefined;

    while (true) {
        const requestStartedAt = Date.now();
        const entities = await get204();
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
