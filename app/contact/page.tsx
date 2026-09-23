import type { Metadata } from "next";
import { contact } from "@/lib/content";
import DarkNav from "@/components/DarkNav";
import PageContactSection from "@/components/PageContactSection";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "I am Steve Fisher - Contact",
  description: contact.metaDescription ?? undefined,
};

export default function ContactPage() {
  return (
    <main className={styles.main}>
      <DarkNav />
      <PageContactSection fullHeight />
    </main>
  );
}
