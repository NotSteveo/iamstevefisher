import type { Metadata } from "next";
import { Suspense } from "react";
import { workIndex } from "@/lib/content";
import WorkFilter from "@/components/WorkFilter";
import ContactSection from "@/components/ContactSection";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: workIndex.title,
  description: workIndex.metaDescription ?? undefined,
};

export default function WorkPage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.title}>Work</h1>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Suspense fallback={null}>
            <WorkFilter
              categories={workIndex.categories}
              projects={workIndex.projects}
              categoryMembership={workIndex.categoryMembership}
            />
          </Suspense>
        </div>
      </section>

      <ContactSection headline="Don't leave me on read." subline="Say hello." />
    </main>
  );
}
