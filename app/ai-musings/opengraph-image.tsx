import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Steve Fisher's AI Musings";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return renderOg({
    eyebrow: "AI Musings",
    title: "Experiments with AI",
    description: "Notes and experiments from a creative director working with AI.",
  });
}
