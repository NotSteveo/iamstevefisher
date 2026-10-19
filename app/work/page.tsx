import type { Metadata } from "next";
import { Suspense } from "react";
import { Wittgenstein, Geist_Mono } from "next/font/google";
import { workIndex } from "@/lib/content";
import DarkNav from "@/components/DarkNav";
import QuantumMetricTooltip from "@/components/QuantumMetricTooltip";
import WorkScrollList from "@/components/WorkScrollList";
import PageContactSection from "@/components/PageContactSection";
import styles from "./work.module.css";

const wittgenstein = Wittgenstein({
  variable: "--font-word-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const geistMono = Geist_Mono({
  variable: "--font-word-mono",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "I am Steve Fisher - Work",
  description: workIndex.metaDescription ?? undefined,
};

export default function WorkPage() {
  return (
    <main id="main-content" tabIndex={-1} className={`${wittgenstein.variable} ${geistMono.variable}`}>
      <DarkNav />

      <section className={styles.hero}>
        <div className={styles.heroWrap}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Work</h1>
            <p className={styles.reelLine}>
              Currently Creative Director @{" "}
              <QuantumMetricTooltip variant="modal" />
            </p>
          </div>
        </div>
      </section>

      <section className={styles.listSection}>
        <div className={styles.listWrap}>
          <Suspense fallback={null}>
            <WorkScrollList
              categories={workIndex.categories}
              projects={workIndex.projects}
              categoryMembership={workIndex.categoryMembership}
            />
          </Suspense>
        </div>
      </section>

      <PageContactSection />
    </main>
  );
}
