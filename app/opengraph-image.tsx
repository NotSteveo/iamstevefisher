import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Steve Fisher, creative director";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return renderOg({
    eyebrow: "Creative Director",
    title: "Steve Fisher",
    image: "/images/69b46e7c5762c78ae2c8c798_LEAP-26_cover.jpg",
    description: "Art direction, motion and web design at the intersection of brand and AI.",
  });
}
