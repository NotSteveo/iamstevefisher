import assetMap from "./asset-map.json";

const map = assetMap as Record<string, string>;

/** Resolve a remote Webflow CDN URL to the local downloaded copy under /public. */
export function asset(url: string | undefined | null): string {
  if (!url) return "";
  return map[url] ?? url;
}
