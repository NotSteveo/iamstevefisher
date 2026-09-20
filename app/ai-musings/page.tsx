import type { Metadata } from "next";
import Link from "next/link";
import { aiMusingsIndex } from "@/lib/content";
import ContactSection from "@/components/ContactSection";
import styles from "./ai-musings.module.css";

export const metadata: Metadata = {
  title: aiMusingsIndex.title,
  description: aiMusingsIndex.metaDescription ?? undefined,
};

export default function AiMusingsPage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.title}>AI musings</h1>
        </div>
      </section>

      <section>
        <div className={`wrap ${styles.grid}`}>
          {aiMusingsIndex.posts.map((post) => (
            <Link key={post.title} href={post.href} className={styles.card}>
              <div className={styles.cardArt} aria-hidden>
                <span className={styles.sparkleText}>Just add sparkles.</span>
                <span className={styles.sparkleSubtext}>Click anywhere to be relevant.</span>
              </div>
              <div className={styles.cardTitle}>{post.title}</div>
              <div className={styles.tagWrap}>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ContactSection headline="Don't leave me on read." subline="Say hello." />
    </main>
  );
}
