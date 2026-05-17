/**
 * Builds messages/yachtContent.es.json from yachts-en-dump.json using the same Google
 * Translate flow as scripts/build-villas-content-es.mjs (client=gtx&dt=t).
 *
 * Prerequisites: npx tsx scripts/dump-yachts-en.ts
 * Run: node scripts/build-yacht-content-es.mjs
 *
 * Saves incrementally — re-run skips yacht ids already present in the output file.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dumpPath = join(root, "yachts-en-dump.json");
const outPath = join(root, "messages/yachtContent.es.json");

const cache = new Map();

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function translateEnToEs(text, attempt = 0) {
  const key = `${text}`;
  if (!key.trim()) return key;
  if (cache.has(key)) return cache.get(key);

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", "es");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text.slice(0, 4500));

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    if (attempt < 5) {
      await sleep(2000 * (attempt + 1));
      return translateEnToEs(text, attempt + 1);
    }
    throw new Error(`Translate HTTP ${res.status}: ${text.slice(0, 40)}…`);
  }

  const data = await res.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] ?? "").join("")
    : text;

  cache.set(key, translated);
  await sleep(250);
  return translated;
}

async function translateLong(text) {
  if (text.length <= 4500) return translateEnToEs(text);

  const chunks = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= 4500) {
      chunks.push(rest);
      break;
    }
    let cut = rest.lastIndexOf(". ", 4500);
    if (cut < 2000) cut = rest.lastIndexOf("\n\n", 4500);
    if (cut < 2000) cut = rest.lastIndexOf(" ", 4500);
    if (cut < 1) cut = 4500;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }

  const parts = [];
  for (const chunk of chunks) {
    if (chunk) parts.push(await translateEnToEs(chunk));
  }
  return parts.join("\n\n");
}

function loadExisting() {
  if (!existsSync(outPath)) return {};
  try {
    const raw = JSON.parse(readFileSync(outPath, "utf8"));
    return raw.yachtContent ?? {};
  } catch {
    return {};
  }
}

function save(yachtContent) {
  writeFileSync(
    outPath,
    `${JSON.stringify({ yachtContent }, null, 2)}\n`,
    "utf8",
  );
}

if (!existsSync(dumpPath)) {
  console.error(`Missing ${dumpPath}; run: npx tsx scripts/dump-yachts-en.ts`);
  process.exit(1);
}

const DUMP = JSON.parse(readFileSync(dumpPath, "utf8"));
const yachtContent = loadExisting();

/** @type {Set<string>} */
const shortPieces = new Set();

for (const y of Object.values(DUMP)) {
  if (typeof y.subtitle === "string") shortPieces.add(y.subtitle);
  if (typeof y.cardPriceLine === "string") shortPieces.add(y.cardPriceLine);

  if (typeof y.aboutTagline === "string") shortPieces.add(y.aboutTagline);
  if (typeof y.aboutQuote === "string") shortPieces.add(y.aboutQuote);

  for (const h of y.highlights ?? []) shortPieces.add(h);
  for (const incl of y.inclusions ?? []) shortPieces.add(incl);
  for (const pol of y.policyNotes ?? []) shortPieces.add(pol);

  if (Array.isArray(y.promotions)) {
    for (const p of y.promotions) {
      if (typeof p?.label === "string") shortPieces.add(p.label);
      if (typeof p?.detail === "string") shortPieces.add(p.detail);
    }
  }

  for (const tier of y.priceTiers ?? []) {
    shortPieces.add(tier.durationLabel);
    if (typeof tier.note === "string") shortPieces.add(tier.note);
  }
}

const shortsSorted = [...shortPieces].filter((s) => typeof s === "string" && s.trim());

console.log(`Translating ${shortsSorted.length} unique short strings…`);
const shortEs = new Map();

let si = 0;
for (const s of shortsSorted) {
  si += 1;
  process.stdout.write(`\r[short ${si}/${shortsSorted.length}]`);
  shortEs.set(s, await translateEnToEs(s));
}
console.log("");

function mapShort(s) {
  return shortEs.get(s) ?? s;
}

const ids = [...Object.keys(DUMP)].sort();
let yi = 0;

for (const id of ids) {
  yi += 1;

  const y = DUMP[id];

  const existingDone = yachtContent[id];
  if (
    typeof existingDone === "object" &&
    existingDone !== null &&
    typeof existingDone.description === "string" &&
    typeof existingDone.cardPriceLine === "string"
  ) {
    console.log(`[${yi}/${ids.length}] ${id} — skip`);
    continue;
  }

  console.log(`[${yi}/${ids.length}] ${id}`);

  const entry = {
    description: await translateLong(String(y.description)),
    highlights: (y.highlights ?? []).map((h) => mapShort(String(h))),
    priceTiers: (y.priceTiers ?? []).map((t) => ({
      durationLabel: mapShort(String(t.durationLabel)),
      note: mapShort(String(t.note ?? "")),
    })),
    subtitle: mapShort(String(y.subtitle)),
    cardPriceLine: mapShort(String(y.cardPriceLine)),
  };

  const inc = y.inclusions;
  if (Array.isArray(inc) && inc.length > 0) entry.inclusions = inc.map((s) => mapShort(String(s)));

  const pol = y.policyNotes;
  if (Array.isArray(pol) && pol.length > 0) entry.policyNotes = pol.map((s) => mapShort(String(s)));

  if (typeof y.aboutTagline === "string" && y.aboutTagline.trim()) {
    entry.aboutTagline = mapShort(y.aboutTagline);
  }
  if (typeof y.aboutQuote === "string" && y.aboutQuote.trim()) {
    entry.aboutQuote = mapShort(y.aboutQuote);
  }

  if (Array.isArray(y.promotions) && y.promotions.length > 0) {
    entry.promotions = await Promise.all(
      y.promotions.map(async (p) => ({
        label: await translateEnToEs(String(p.label)),
        detail: await translateEnToEs(String(p.detail)),
      })),
    );
  }

  yachtContent[id] = entry;
  save(yachtContent);
}

console.log(
  `Done — ${Object.keys(yachtContent).length} yachts → ${outPath}`,
);
