import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aiMusingsSlugs, getAiMusingsPost, type Section } from "@/lib/content";
import DarkNav from "@/components/DarkNav";
import PageContactSection from "@/components/PageContactSection";
import CaseStudyVideo from "@/components/CaseStudyVideo";
import styles from "./post.module.css";

export function generateStaticParams() {
  return aiMusingsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getAiMusingsPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.metaDescription ?? undefined };
}

// The original "how-to-brand-ai" post is just a heading + one paragraph +
// an outbound link — a pointer to a project hosted elsewhere. A post like
// "locksmith" is the write-up itself, so it uses a handful of richer
// section types (sub-heading, list, steps, figure, pull quote) on top of
// those, rendered below in source order.
function ArticleBlock({ section }: { section: Section }) {
  switch (section.type) {
    case "sub-heading":
      return <h2 className={styles.subheading}>{section.text as string}</h2>;
    case "body paragraph":
      return <p className={styles.paragraph}>{section.text as string}</p>;
    case "credit line":
      return <p className={styles.creditLine}>{section.text as string}</p>;
    case "pull quote":
      return <blockquote className={styles.pullQuote}>{section.text as string}</blockquote>;
    case "list":
      return (
        <ul className={styles.list}>
          {(section.text as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className={styles.steps}>
          {(section.text as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "figure":
      return (
        <figure className={styles.figure}>
          <div className={styles.figureFrame}>
            <Image
              src={section.image as string}
              alt={section.text as string}
              width={section.imageWidth}
              height={section.imageHeight}
              className={styles.figureImage}
              sizes="(max-width: 900px) 100vw, 900px"
            />
          </div>
          <figcaption className={styles.caption}>{section.text as string}</figcaption>
        </figure>
      );
    default:
      return null;
  }
}

export default async function AiMusingsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getAiMusingsPost(slug);
  if (!post) notFound();

  const heading = post.sections.find((s) => s.type === "heading")?.text as string;
  const dek = post.sections.find((s) => s.type === "credit line")?.text as string | undefined;
  const body = post.sections.find((s) => s.type === "body paragraph")?.text as string;
  const link = post.sections.find((s) => s.type === "external link");

  // Everything after the heading/credit-line/lead-paragraph already shown
  // in the hero — the article body only needs its own remaining sections.
  const leadIndex = post.sections.findIndex((s) => s.type === "body paragraph");
  const articleSections = post.sections.filter(
    (s, i) => !(s.type === "heading" || s.type === "credit line" || i === leadIndex),
  );
  const hasArticle = articleSections.some((s) =>
    ["sub-heading", "body paragraph", "list", "steps", "figure", "pull quote"].includes(s.type),
  );

  return (
    <main>
      <DarkNav />

      <section className={styles.hero}>
        <div className={styles.wrap}>
          <h1 className={styles.headline}>{heading}</h1>
          {dek ? <p className={styles.dek}>{dek}</p> : null}
          <p className={styles.body}>{body}</p>
          {link ? (
            <Link
              href={link.href ?? "#"}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.text as string} →
            </Link>
          ) : null}
        </div>

        {post.heroVideo ? (
          <div className={`${styles.wrap} ${styles.heroVideoWrap}`}>
            <div className={styles.deviceFrame}>
              <CaseStudyVideo
                video={post.heroVideo}
                rounded={false}
                className={styles.deviceFrameVideo}
              />
            </div>
          </div>
        ) : null}
      </section>

      {hasArticle ? (
        <section className={styles.article}>
          <div className={styles.wrap}>
            {articleSections.map((section, i) => (
              <ArticleBlock key={`${section.type}-${i}`} section={section} />
            ))}
          </div>
        </section>
      ) : null}

      <PageContactSection />
    </main>
  );
}
