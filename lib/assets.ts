import assetMap from "./asset-map.json";

const map = assetMap as Record<string, string>;

/** Resolve a remote Webflow CDN URL to the local downloaded copy under /public. */
export function asset(url: string | undefined | null): string {
  if (!url) return "";
  return map[url] ?? url;
}

/** Best available alt text for a content image: explicit alt, else the crawl context cleaned up. */
export function altFor(ref: { alt?: string; context?: string }): string {
  if (ref.alt !== undefined) return ref.alt;
  const ctx = ref.context ?? "";
  const explicit = ctx.match(/alt:\s*(.+)$/i);
  return explicit ? explicit[1].trim() : ctx;
}

/** Poster frame (public/posters/<name>.jpg) for a local /videos/... file; undefined for anything else. */
export function posterFor(videoSrc: string | undefined | null): string | undefined {
  if (!videoSrc || !videoSrc.startsWith("/videos/")) return undefined;
  const name = videoSrc.split("/").pop()!.replace(/\.(mp4|webm)$/i, "");
  return `/posters/${name}.jpg`;
}
