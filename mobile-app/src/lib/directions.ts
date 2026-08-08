import { router } from "expo-router";

export function openDirections(latitude: number, longitude: number, name?: string) {
  router.push({
    pathname: "/directions",
    params: { lat: String(latitude), lng: String(longitude), name: name || "Máy" },
  });
}
