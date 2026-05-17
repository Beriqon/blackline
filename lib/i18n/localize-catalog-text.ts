import type { Locale } from "@/lib/i18n/config";
import { hasTranslations } from "@/lib/i18n/config";

/** Exact English → Spanish replacements (longest keys first at runtime). */
const EXACT_ES: Record<string, string> = {
  "Maybach vans": "Vans Maybach",
  "SUV & sprinter": "SUV y sprinter",
  "Daily self-drive": "Autoconducción diaria",
  "Rate on request": "Tarifa bajo consulta",
  "Rates coming soon": "Tarifas próximamente",
  "Photos coming soon": "Fotos próximamente",
  "Photo placeholder": "Marcador de foto",
  Featured: "Destacada",
  "Open full listing": "Ver ficha completa",
  "All areas": "Todas las zonas",
  Residences: "Residencias",
  "Villas & stays": "Villas y estancias",
  Properties: "Propiedades",
  Neighborhood: "Barrio",
  Description: "Descripción",
  Highlights: "Destacados",
  Amenities: "Comodidades",
  "Stay details": "Detalles de la estancia",
  "Nightly rates": "Tarifas por noche",
  Weekday: "Entre semana",
  Weekend: "Fin de semana",
  Location: "Ubicación",
  Bedrooms: "Dormitorios",
  Bathrooms: "Baños",
  "Max guests": "Huéspedes máx.",
  "Property size": "Tamaño",
  "Check-in": "Entrada",
  "Check-out": "Salida",
  Wifi: "Wifi",
  Pool: "Piscina",
  Waterfront: "Frente al agua",
  Balcony: "Balcón",
  "Monday–Thursday only": "Solo lunes a jueves",
  "Most popular": "Más popular",
  "Extra trail time": "Tiempo extra en sendero",
  "Best for groups": "Ideal para grupos",
  "Side-by-side for two": "Side-by-side para dos",
  "Great for families": "Ideal para familias",
  "2-seat UTV": "UTV de 2 plazas",
  "4-seat UTV": "UTV de 4 plazas",
  "per ATV": "por ATV",
  "Sprinter vans": "Vans Sprinter",
  "Party buses": "Autobuses fiesta",
  "Limousines": "Limusinas",
  "Luxury SUVs": "SUV de lujo",
  "Jet skis": "Jet skis",
  "Jetcars": "Jetcars",
  "Fishing trips": "Excursiones de pesca",
  "On your schedule": "En tu horario",
  "Your private chef": "Tu chef privado",
  "Beyond Miami": "Fuera de Miami",
  "Travel chef": "Chef de viaje",
  "Celebrity private chef": "Chef privado celebridad",
  "Banana boat rides": "Paseos en banana boat",
  "Group tow rides — timing with your yacht or beach day":
    "Remolque en grupo — coordinado con tu yate o día de playa",
  "Paddleboard session": "Sesión de paddleboard",
  "Calm-water boards — Miami Beach area":
    "Tablas en aguas tranquilas — zona Miami Beach",
  "Kayak rental / tour": "Alquiler / tour en kayak",
  "Singles or tandem — routed with your stay":
    "Individual o tándem — coordinado con tu estancia",
  "Parasailing": "Parasailing",
  "Shoreline lift — weather & zone permitting":
    "Vuelo costero — según clima y zona",
  "Ultra long range": "Ultra largo alcance",
  "Super mid size": "Super mediano",
  "Mid size": "Mediano",
  "All aircraft": "Toda la flota",
  "Fully enclosed lavatory": "Baño totalmente cerrado",
  "Full galley with catering": "Cocina completa con catering",
  "Climate-controlled cabin": "Cabina con climatización",
  "Power outlets & USB charging": "Enchufes y carga USB",
  "High-speed Wi-Fi": "Wi-Fi de alta velocidad",
  "Stand-up cabin": "Cabina con altura para estar de pie",
  "Berthing seats for sleeping": "Asientos convertibles para dormir",
  "Executive leather seating": "Asientos ejecutivos de cuero",
  "Fold-out work tables": "Mesas de trabajo plegables",
  "Entertainment system": "Sistema de entretenimiento",
  "Full refreshment center": "Centro de refrigerios completo",
  "Wi-Fi connectivity": "Conectividad Wi-Fi",
  "Multiple cabin zones": "Varias zonas en cabina",
  "Forward & aft lavatories": "Baños delantero y trasero",
  "Dedicated sleeping quarters": "Zona dormitorio dedicada",
  "Conference/dining area": "Zona de conferencias/comedor",
  "Crew rest area": "Zona de descanso de tripulación",
  "Refreshment center": "Centro de refrigerios",
  "Wi-Fi available": "Wi-Fi disponible",
  "$40 / person · 60 min": "$40 / persona · 60 min",
  "Shared or private — from $120 / flyer":
    "Compartido o privado — desde $120 / persona en vuelo",
  "charter coordination; route & timing to confirm":
    "coordinación de charter; ruta y horarios por confirmar",
  "(chauffeur)": "(chófer)",
  "Chauffeur rate": "Tarifa con chófer",
  "Chauffeur fleet": "Flota con chófer",
  "Available chauffeur vehicles": "Vehículos con chófer disponibles",
  "Vehicle details": "Detalles del vehículo",
  "Vehicle description": "Descripción del vehículo",
  "Important requirements": "Requisitos importantes",
  "Photo coming soon": "Foto próximamente",
  Enlarge: "Ampliar",
  Open: "Ver",
};

/** Regex replacements applied after exact matches (order matters). */
const PATTERN_ES: readonly { pattern: RegExp; replace: string }[] = [
  { pattern: /\bUp to (\d+)\b/gi, replace: "Hasta $1" },
  { pattern: /\bFrom\b/g, replace: "Desde" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*bed\b/gi, replace: "$1 dorm" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*bath\b/gi, replace: "$1 baños" },
  { pattern: /\bsq\s*ft\b/gi, replace: "pies²" },
  { pattern: /\/\s*hour\b/gi, replace: "/ hora" },
  { pattern: /\/\s*day\b/gi, replace: "/ día" },
  { pattern: /\b(\d+)\s+days\b/gi, replace: "$1 días" },
  { pattern: /\b1\s+day\b/gi, replace: "1 día" },
  { pattern: /\b(\d+)\s+day\b/gi, replace: "$1 día" },
  { pattern: /\/\s*night\b/gi, replace: "/ noche" },
  { pattern: /\bper\s+ATV\b/gi, replace: "por ATV" },
  { pattern: /\b(\d+)[–-](\d+)\s*hrs\b/gi, replace: "$1–$2 horas" },
  { pattern: /\b(\d+)\s*hrs\b/gi, replace: "$1 horas" },
  { pattern: /\/\s*hr\b/gi, replace: "/ hora" },
  { pattern: /\b1\s+hour\b/gi, replace: "1 hora" },
  { pattern: /\b(\d+)\s+hours\b/gi, replace: "$1 horas" },
  { pattern: /\b(\d+)\s+min\b/gi, replace: "$1 min" },
  { pattern: /\bwaterfront\b/gi, replace: "frente al agua" },
  { pattern: /\bpool estate\b/gi, replace: "propiedad con piscina" },
  { pattern: /\bestate\b/gi, replace: "propiedad" },
  { pattern: /\bself-drive\b/gi, replace: "autoconducción" },
  { pattern: /\bhourly rental\b/gi, replace: "alquiler por hora" },
  { pattern: /\bdaily self-drive\b/gi, replace: "autoconducción diaria" },
  { pattern: /\b(\d[\d,]*)\s*miles\b/gi, replace: "$1 millas" },
  { pattern: /\bcubic feet\b/gi, replace: "pies cúbicos" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*feet\b/gi, replace: "$1 pies" },
  { pattern: /\b(\d+)\s*ft\b/gi, replace: "$1 pies" },
  { pattern: /\b(\d+)\s*in\b/gi, replace: "$1 pulg" },
];

function applyPatterns(text: string): string {
  let out = text;
  for (const { pattern, replace } of PATTERN_ES) {
    out = out.replace(pattern, replace);
  }
  return out;
}

/**
 * Localizes catalog copy embedded in English data files (prices, beds/baths, units).
 * Product names (Ferrari, venue names) are left unchanged.
 */
export function localizeCatalogText(text: string, locale: Locale): string {
  if (!text || !hasTranslations(locale) || locale === "en") {
    return text;
  }

  if (EXACT_ES[text]) {
    return EXACT_ES[text];
  }

  let out = text;
  const sortedExact = Object.keys(EXACT_ES).sort((a, b) => b.length - a.length);
  for (const en of sortedExact) {
    if (out.includes(en)) {
      out = out.split(en).join(EXACT_ES[en]!);
    }
  }

  return applyPatterns(out);
}
