import { NestFactory } from "@nestjs/core";
import { AppModule, ObserveInstrument } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument
  });

  app.use(cookieParser());
  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("OnTime API")
    .setDescription("API da plataforma OnTime")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT ?? 3001);
}

async function get204(): Promise<Array<{
  location?: { value?: { coordinates?: unknown } };
}>> {
  const response = await fetch(
    "https://broker.fiware.urbanplatform.portodigital.pt/v2/entities?q=vehicleType==bus;annotations==stcp:route:204&limit=1"
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch route 204 entity: ${response.status}`);
  }

  const entities = await response.json();
  return entities;
}
async function coordinatesUpdate() {
  try {
    const entities = await get204();
    const coordinates = entities[0]?.location?.value?.coordinates;
    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !coordinates.every((coordinate) => Number.isFinite(coordinate))
    ) {
      throw new Error("Route 204 response contains no valid location coordinates");
    }
    return coordinates;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
}

export async function coordinatesUpdateInterval(
  oldCoordinates: number[] = [],
  oldSeconds = 0
) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newCoordinates = await coordinatesUpdate();
  if (!newCoordinates) {
    return coordinatesUpdateInterval(oldCoordinates, oldSeconds);
  }

  const seconds = oldSeconds + 1;

  const changed =
    JSON.stringify(newCoordinates) !== JSON.stringify(oldCoordinates);

  console.log({
    coordinates: newCoordinates,
    seconds,
    changed
  });

  return coordinatesUpdateInterval(newCoordinates, seconds);
  
}


bootstrap();
coordinatesUpdateInterval().catch((error) => {
  console.error("Error in coordinates update interval:", error);
});
