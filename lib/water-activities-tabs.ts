export type WaterActivityTab =
  | "overview"
  | "pwc"
  | "kayak"
  | "sup"
  | "banana"
  | "parasailing"
  | "fishing";

export const WATER_ACTIVITY_TABS: {
  id: WaterActivityTab;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "pwc", label: "Jet skis & jetcars" },
  { id: "kayak", label: "Kayak" },
  { id: "sup", label: "Paddle board" },
  { id: "banana", label: "Banana boat" },
  { id: "parasailing", label: "Parasailing" },
  { id: "fishing", label: "Fishing" },
];

const VALID = new Set<WaterActivityTab>(
  WATER_ACTIVITY_TABS.map((t) => t.id),
);

export function parseWaterActivityTab(
  raw: string | null,
): WaterActivityTab {
  if (raw === "paddle") {
    return "kayak";
  }
  if (raw && VALID.has(raw as WaterActivityTab)) {
    return raw as WaterActivityTab;
  }
  return "overview";
}
