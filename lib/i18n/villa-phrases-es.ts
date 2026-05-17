/** Longest-first phrase replacements for villa catalog copy (applied after localizeCatalogText). */
export const VILLA_PHRASES_ES: readonly { en: string; es: string }[] = [
  { en: "House rules and cancellation terms are confirmed when you inquire.", es: "Las normas de la casa y la cancelación se confirman al consultar." },
  { en: "Rates shown are per night; taxes and fees are confirmed at booking.", es: "Las tarifas mostradas son por noche; impuestos y tasas se confirman al reservar." },
  { en: "Rates and minimum nights are confirmed when you inquire.", es: "Tarifas y noches mínimas se confirman al consultar." },
  { en: "Rates and event policies are confirmed when you inquire.", es: "Tarifas y políticas de eventos se confirman al consultar." },
  { en: "Pool use and quiet hours are confirmed at booking.", es: "Uso de piscina y horas de silencio se confirman al reservar." },
  { en: "Pool and spa use guidelines confirmed at booking.", es: "Normas de uso de piscina y spa confirmadas al reservar." },
  { en: "House rules for game room equipment confirmed at booking.", es: "Normas del salón de juegos confirmadas al reservar." },
  { en: "Maximum guests: 12.", es: "Huéspedes máximos: 12." },
  { en: "Children, pets, events, and smoking are not permitted.", es: "No se permiten niños, mascotas, eventos ni fumar." },
  { en: "Confirmed when you book", es: "Confirmado al reservar" },
  { en: "Details coming soon", es: "Detalles próximamente" },
  { en: "After 3:00 pm", es: "Después de las 15:00" },
  { en: "After 11:00 am", es: "Después de las 11:00" },
  { en: "After 12:00 pm", es: "Después de las 12:00" },
  { en: "After 4:00 pm", es: "Después de las 16:00" },
  { en: "Single-family pool home", es: "Casa unifamiliar con piscina" },
  { en: "Miami area", es: "Zona de Miami" },
  { en: "waterfront", es: "frente al agua" },
  { en: "private pool home", es: "casa privada con piscina" },
  { en: "pool & spa estate", es: "propiedad con piscina y spa" },
  { en: "game room estate", es: "propiedad con salón de juegos" },
  { en: "pool & fireside lounge", es: "piscina y salón con chimenea" },
  { en: "indoor-outdoor", es: "interior-exterior" },
  { en: "Free parking on premises", es: "Aparcamiento gratuito en la propiedad" },
  { en: "Washer and dryer", es: "Lavadora y secadora" },
  { en: "Air conditioning", es: "Aire acondicionado" },
  { en: "Full kitchen", es: "Cocina completa" },
  { en: "Private pool", es: "Piscina privada" },
  { en: "Outdoor grill", es: "Parrilla exterior" },
  { en: "Outdoor kitchen and grill", es: "Cocina exterior y parrilla" },
  { en: "Private pool and spa", es: "Piscina privada y spa" },
  { en: "Dedicated workspace", es: "Espacio de trabajo" },
  { en: "Coffee machine", es: "Cafetera" },
  { en: "Hair dryer", es: "Secador de pelo" },
  { en: "Boat dock", es: "Muelle para embarcaciones" },
  { en: "Outdoor kitchen", es: "Cocina exterior" },
  { en: "Pool table", es: "Mesa de billar" },
  { en: "Arcade game", es: "Máquina arcade" },
  { en: "Key Largo", es: "Key Largo" },
  { en: "Florida Keys", es: "Florida Keys" },
  { en: "Golden Isles", es: "Golden Isles" },
  { en: "Venetian Islands", es: "Venetian Islands" },
  { en: "Design District", es: "Design District" },
  { en: "North Miami", es: "North Miami" },
  { en: "Miami Beach", es: "Miami Beach" },
  { en: "Coral Gables", es: "Coral Gables" },
  { en: "Coral Way", es: "Coral Way" },
  { en: "Brickell", es: "Brickell" },
  { en: "Downtown Miami", es: "Downtown Miami" },
  { en: "Hallandale Beach", es: "Hallandale Beach" },
  { en: "Miami Shores", es: "Miami Shores" },
  { en: "Fort Lauderdale", es: "Fort Lauderdale" },
  { en: "Pompano Beach", es: "Pompano Beach" },
  { en: "Golden Beach", es: "Golden Beach" },
  { en: "Upper East Side", es: "Upper East Side" },
  { en: " · ", es: " · " },
];

export function applyVillaPhrasesEs(text: string): string {
  let out = text;
  const sorted = [...VILLA_PHRASES_ES].sort((a, b) => b.en.length - a.en.length);
  for (const { en, es } of sorted) {
    if (out.includes(en)) {
      out = out.split(en).join(es);
    }
  }
  return out;
}
