import { CENTER_CITIES } from "@/data/centers";

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export type LocationStatus = "loading" | "ready" | "no-center" | "unavailable";

type ReverseGeocodeResult = {
  address?: {
    city?: string;
    town?: string;
    province?: string;
    state?: string;
  };
};

function matchingCenterCity(place: string | undefined, longitude: number) {
  if (!place) return undefined;

  const detected = norm(place);
  if (detected === "istanbul") {
    return longitude >= 29 ? "İstanbul (Anadolu)" : "İstanbul (Avrupa)";
  }
  if (detected === "kocaeli") return "İzmit";

  return CENTER_CITIES.find((centerCity) => norm(centerCity) === detected);
}

export async function detectCenterCity(): Promise<string | undefined> {
  if (!navigator.geolocation) throw new Error("Geolocation unavailable");
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 300_000,
    });
  });
  const { latitude, longitude } = position.coords;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!response.ok) throw new Error("Konum çözümlenemedi");
  const result = (await response.json()) as ReverseGeocodeResult;
  const address = result.address;
  return matchingCenterCity(
    address?.city ?? address?.town ?? address?.province ?? address?.state,
    longitude,
  );
}
