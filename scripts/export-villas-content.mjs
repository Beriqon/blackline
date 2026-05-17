import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VILLAS } from "../lib/villas-data.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const villaContent = {};

for (const v of VILLAS) {
  const entry = { lede: v.lede, description: v.description };
  v.highlights.forEach((h, i) => {
    entry[`highlight${i}`] = h;
  });
  villaContent[v.id] = entry;
}

writeFileSync(
  join(root, "scripts/villas-content-en-export.json"),
  JSON.stringify({ villaContent }, null, 2),
);

console.log(Object.keys(villaContent).length, "villas exported");
