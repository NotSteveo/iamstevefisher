import type { Metadata } from "next";
import { Wittgenstein, Geist_Mono } from "next/font/google";
import DarkNav from "@/components/DarkNav";
import AboutIntro from "@/components/AboutIntro";
import AboutSkills from "@/components/AboutSkills";
import AboutPath from "@/components/AboutPath";
import AboutHuman from "@/components/AboutHuman";
import PageContactSection from "@/components/PageContactSection";

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
  title: "I am Steve Fisher - About",
  description: "About Steve Fisher",
};

export default function AboutPage() {
  return (
    <main className={`${wittgenstein.variable} ${geistMono.variable}`}>
      <DarkNav />

      <AboutIntro />

      <AboutSkills />

      <AboutPath />

      <AboutHuman />

      <PageContactSection />
    </main>
  );
}
