import { fetchIracingData } from "../client";
import { trackSchema, carSchema, type Track, type Car } from "../schemas/reference";

export async function getTrack(trackId: number): Promise<Track> {
  return fetchIracingData("/data/track/get", { track_id: trackId }, trackSchema);
}

export async function getCar(carId: number): Promise<Car> {
  return fetchIracingData("/data/car/get", { car_id: carId }, carSchema);
}
