import { workIndex, getWorkPage } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Steve Fisher case study";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = workIndex.projects.find((p) => p.href === `/work/${slug}`);
  const page = getWorkPage(slug);

  const fullTitle = card?.title ?? page?.title ?? "Case study";
  const [eyebrow, title] = fullTitle.includes(" | ") ? fullTitle.split(" | ") : ["Case study", fullTitle];

  return renderOg({
    eyebrow,
    title,
    description: card?.note,
    image: card?.coverImage ?? page?.images[0]?.url,
  });
}
