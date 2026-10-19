import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Steve Fisher's work";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return renderOg({
    eyebrow: "Portfolio",
    title: "Selected work",
    image: "/images/69b46e7c5762c78ae2c8c798_LEAP-26_cover.jpg",
    description: "Brand, motion and web design for SaaS and conference experiences.",
  });
}
