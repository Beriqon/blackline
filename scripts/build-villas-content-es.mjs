/**
 * Generates messages/villasContent.es.json from lib/villas-data.ts (en→es).
 * Run: npx tsx scripts/build-villas-content-es.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { VILLAS } from "../lib/villas-data.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "messages/villasContent.es.json");
const cache = new Map();

function loadExisting() {
  if (!existsSync(outPath)) return {};
  try {
    const raw = JSON.parse(readFileSync(outPath, "utf8"));
    return raw.villaContent ?? {};
  } catch {
    return {};
  }
}

function save(villaContent) {
  writeFileSync(
    outPath,
    `${JSON.stringify({ villaContent }, null, 2)}\n`,
    "utf8",
  );
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function translateEnToEs(text, attempt = 0) {
  if (!text?.trim()) return text;
  if (cache.has(text)) return cache.get(text);

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

  cache.set(text, translated);
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
    if (cut < 2000) cut = rest.lastIndexOf(" ", 4500);
    if (cut < 1) cut = 4500;
    chunks.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }

  const parts = [];
  for (const chunk of chunks) {
    if (chunk) parts.push(await translateEnToEs(chunk));
  }
  return parts.join(" ");
}

const villaContent = loadExisting();
const done = new Set(Object.keys(villaContent));

let i = 0;
for (const villa of VILLAS) {
  i += 1;
  if (done.has(villa.id)) {
    console.log(`[${i}/${VILLAS.length}] ${villa.id} — skip`);
    continue;
  }

  console.log(`[${i}/${VILLAS.length}] ${villa.id}`);

  const entry = {
    lede: await translateLong(villa.lede),
    description: await translateLong(villa.description),
  };

  for (let idx = 0; idx < villa.highlights.length; idx++) {
    entry[`highlight${idx}`] = await translateEnToEs(villa.highlights[idx]);
  }

  villaContent[villa.id] = entry;
  save(villaContent);
}

console.log(`Done — ${Object.keys(villaContent).length} villas → ${outPath}`);
