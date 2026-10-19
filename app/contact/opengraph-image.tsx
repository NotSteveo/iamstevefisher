import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Contact Steve Fisher";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return renderOg({
    eyebrow: "Contact",
    title: "Let's make it happen",
    description: "Have a project in mind? Say hello.",
  });
}
