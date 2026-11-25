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
    while (true){
        await new Promise(resolve => setTimeout(resolve, 30*1000)); // 30 segundos
        const entities = await get204();
        let coordinates: any[] = [];
        entities.forEach((bus: { location: { value: { coordinates: any; }; }; }) => {
            coordinates.push(bus.location.value.coordinates);
        });
        onUpdate(coordinates);        
    }
}