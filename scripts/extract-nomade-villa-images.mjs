/**
 * One-off: fetch Nomade property pages and list image URLs from HTML/CSS.
 * Run: node scripts/extract-nomade-villa-images.mjs
 */
const pages = [
  ["aria", "https://nomadevillacollection.com/properties/aria/"],
  ["divina", "https://nomadevillacollection.com/properties/divina/"],
  ["fendi", "https://nomadevillacollection.com/properties/fendi/"],
  ["granada", "https://nomadevillacollection.com/properties/granada/"],
  ["bodrum", "https://nomadevillacollection.com/properties/villa-bodrum/"],
  [
    "estrella-palacia",
    "https://nomadevillacollection.com/properties/villa-estrella-palacia/",
  ],
  ["manuela", "https://nomadevillacollection.com/properties/villa-manuela/"],
];

function uniqSorted(arr) {
  return [...new Set(arr)].sort();
}

for (const [id, url] of pages) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "BlacklineSiteSync/1.0 (image list for partner listings)",
    },
  });
  const html = await res.text();
  const found = [];
  const re =
    /https:\/\/(?:www\.)?nomadevillacollection\.com\/wp-content\/uploads\/[^"'\s)]+?\.(?:webp|jpg|jpeg|png)/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const u = m[0].replaceAll("\\/", "/");
    if (
      !u.includes("emoji") &&
      !u.includes("/css/") &&
      !u.endsWith(".css")
    ) {
      found.push(u);
    }
  }
  const unique = uniqSorted(found);
  console.log(`\n=== ${id} (${unique.length}) ===`);
  unique.slice(0, 24).forEach((u) => console.log(u));
}
