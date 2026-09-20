import type { Metadata } from "next";
import { contact } from "@/lib/content";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: contact.title,
  description: contact.metaDescription ?? undefined,
};

export default function ContactPage() {
  const headline = contact.sections.find((s) => s.type === "hero headline")?.text as string;

  return (
    <main>
      <ContactSection headline={headline} compact />
    </main>
  );
}
