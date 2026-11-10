import "server-only";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAppBaseUrl } from "./stripe-client";

const MAX_BYTES = 6 * 1024 * 1024;
const trustedRemote = (url: URL) => url.protocol === "https:" && !url.username && !url.password && !url.port && (
  url.hostname === "images.unsplash.com" ||
  (url.hostname === "nomadevillacollection.com" && url.pathname.startsWith("/wp-content/uploads/")) ||
  (url.hostname === "hlalndhldrjcnohuegiw.supabase.co" && url.pathname.startsWith("/storage/v1/object/public/website-media/"))
);

async function fetchImage(url: URL) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(6000), cache: "no-store" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/") || Number(response.headers.get("content-length")) > MAX_BYTES) throw new Error("Image unavailable");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Image unavailable");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new Error("Image too large");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks);
}

export async function confirmationImage(src: string | undefined): Promise<Uint8Array | null> {
  if (!src) return null;
  try {
    let bytes: Uint8Array;
    if (src.startsWith("/") && !src.startsWith("//")) {
      const pathname = decodeURIComponent(src.split("?")[0]);
      if (pathname.includes("\0") || pathname.includes("\\") || pathname.split("/").includes("..")) return null;
      const root = await realpath(path.join(process.cwd(), "public"));
      try {
        const file = await realpath(path.resolve(root, `.${pathname}`));
        if (!file.startsWith(root + path.sep)) return null;
        bytes = await readFile(file);
      } catch {
        // Serverless deployments can serve public assets without bundling them
        // into the function. Only use the configured application origin here.
        const base = new URL(getAppBaseUrl());
        if (base.protocol !== "https:" && !(process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(base.hostname))) return null;
        bytes = await fetchImage(new URL(pathname, base));
      }
    } else {
      const url = new URL(src);
      if (!trustedRemote(url)) return null;
      bytes = await fetchImage(url);
    }
    if (bytes.byteLength > MAX_BYTES) return null;
    return await sharp(bytes, { limitInputPixels: 40_000_000 }).rotate().resize(640, 400, { fit: "cover" }).jpeg({ quality: 84 }).toBuffer();
  } catch { return null; }
}
