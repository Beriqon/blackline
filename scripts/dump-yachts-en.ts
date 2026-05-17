import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mod = await import(pathToFileURL(join(root, "lib/yachts-data.ts")).href);

const out: Record<string, unknown> = {};
for (const y of mod.YACHTS) {
  out[y.id] = {
    subtitle: y.subtitle,
    cardPriceLine: y.cardPriceLine,
    aboutTagline: y.aboutTagline,
    aboutQuote: y.aboutQuote,
    description: y.description,
    highlights: [...y.highlights],
    inclusions: y.inclusions ? [...y.inclusions] : undefined,
    policyNotes: y.policyNotes ? [...y.policyNotes] : undefined,
    priceTiers: y.priceTiers.map((tier: { durationLabel: string; note?: string | null }) => ({
      durationLabel: tier.durationLabel,
      note: tier.note,
    })),
    promotions: y.promotions ? [...y.promotions] : undefined,
  };
}
writeFileSync(join(root, "yachts-en-dump.json"), JSON.stringify(out, null, 2));
console.log(Object.keys(out).length);
}

main();
