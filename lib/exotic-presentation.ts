import type { ExoticCar } from "@/lib/exotic-cars-data";
export const EXOTIC_FILTER_KEYS = ["page", "q", "brand", "budget", "seats", "sort", "featured", "photos"] as const;
export function exoticPhotos(car: ExoticCar): readonly string[] {
    return car.galleryImages?.length ? car.galleryImages : car.coverImage ? [car.coverImage] : [];
}
export function exoticSeats(car: ExoticCar): number {
    return parseInt(car.specs?.find(row => row.label === "Seats")?.value ?? "0", 10) || 0;
}
export function exoticSpec(car: ExoticCar, label: string): string | undefined {
    return car.specs?.find(row => row.label === label)?.value;
}
