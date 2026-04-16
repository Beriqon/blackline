import fs from "fs";

const file = process.argv[2];
const needle = process.argv[3];
if (!file || !needle) {
  console.error("Usage: node scripts/list-villa-images.mjs <html-file> <substring>");
  process.exit(1);
}
const h = fs.readFileSync(file, "utf8");
const re =
  /https:\/\/(?:www\.)?nomadevillacollection\.com\/wp-content\/uploads\/[^"'\s)]+?\.(?:webp|jpg|jpeg|png)/gi;
const s = new Set();
let m;
while ((m = re.exec(h)) !== null) {
  const u = m[0];
  if (u.toLowerCase().includes(needle.toLowerCase())) s.add(u);
}
[...s]
  .sort()
  .forEach((u) => console.log(u));
