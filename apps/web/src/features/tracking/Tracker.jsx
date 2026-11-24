import axios from "axios";

async function get201() {
  const response = await axios.get(`https://broker.fiware.urbanplatform.portodigital.pt/v2/entities?q=vehicleType==bus;annotations==stcp:route:201&limit=1`, {
    withCredentials: true,
  });

  return response;
}
async function coordinatesUpdate() {
  try {
    const response = await get201();
    const entity = response.data[0];
    const coordinates = entity.location.value.coordinates;
    return coordinates;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
}

export async function coordinatesUpdateInterval(
  oldCoordinates = [],
  oldSeconds = 0
) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newCoordinates = await coordinatesUpdate();
  if (!newCoordinates) return;

  const seconds = oldSeconds + 1;

  const changed =
    JSON.stringify(newCoordinates) !== JSON.stringify(oldCoordinates);

  // Entregar os valores obtidos
  console.log({
    coordinates: newCoordinates,
    seconds,
    changed
  });


  return coordinatesUpdateInterval(newCoordinates, seconds);
  
}
