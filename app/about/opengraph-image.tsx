import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "About Steve Fisher";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return renderOg({
    eyebrow: "About",
    title: "Hi, I'm Steve",
    description: "A creative director helping SaaS companies tell better stories and build stronger brands.",
  });
}
