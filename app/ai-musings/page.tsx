import type { Metadata } from "next";
import { aiMusingsIndex } from "@/lib/content";
import DarkNav from "@/components/DarkNav";
import AiMusingsCard from "@/components/AiMusingsCard";
import PageContactSection from "@/components/PageContactSection";
import styles from "./ai-musings.module.css";

export const metadata: Metadata = {
  title: "I am Steve Fisher - AI Musings",
  description: aiMusingsIndex.metaDescription ?? undefined,
};

export default function AiMusingsPage() {
  return (
    <main>
      <DarkNav />

      <section className={styles.hero}>
        <div className={styles.wrap}>
          <h1 className={styles.title}>AI Musings</h1>
        </div>
      </section>

      <section className={styles.listSection}>
        <div className={styles.wrap}>
          <div className={styles.grid}>
            {aiMusingsIndex.posts.map((post) => (
              <AiMusingsCard key={post.title} post={post} />
            ))}
          </div>
        </div>
      </section>

      <PageContactSection />
    </main>
  );
}
