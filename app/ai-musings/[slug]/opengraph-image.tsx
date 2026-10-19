import { aiMusingsIndex, getAiMusingsPost } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Steve Fisher AI Musings";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = aiMusingsIndex.posts.find((p) => p.href === `/ai-musings/${slug}`);
  const post = getAiMusingsPost(slug);

  return renderOg({
    eyebrow: "AI Musings",
    title: post?.title ?? card?.title ?? "AI Musings",
    description: post?.metaDescription ?? card?.note ?? undefined,
    image: card?.coverImage,
  });
}
