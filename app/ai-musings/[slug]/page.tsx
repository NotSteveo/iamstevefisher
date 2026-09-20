import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aiMusingsSlugs, getAiMusingsPost } from "@/lib/content";
import ContactSection from "@/components/ContactSection";
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

export default async function AiMusingsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getAiMusingsPost(slug);
  if (!post) notFound();

  const heading = post.sections.find((s) => s.type === "heading")?.text as string;
  const body = post.sections.find((s) => s.type === "body paragraph")?.text as string;
  const link = post.sections.find((s) => s.type === "external link");

  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.headline}>{heading}</h1>
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
      </section>

      <ContactSection headline="Don't leave me on read." subline="Say hello." />
    </main>
  );
}
