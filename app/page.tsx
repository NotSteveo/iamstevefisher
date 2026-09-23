import type { Metadata } from "next";
import { Wittgenstein, Geist_Mono } from "next/font/google";
import HeroRevealTriptych from "@/components/HeroRevealTriptych";
import PortfolioIntro from "@/components/PortfolioIntro";
import SelectedWorkScroll from "@/components/SelectedWorkScroll";
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
  title: "I am Steve Fisher - Art Direction, Motion Design, Web Design, and more.",
  description:
    "Steve Fisher is a creative director working at the intersection of brand and AI, helping SaaS companies tell better stories, build stronger brands, and create smarter digital experiences.",
};

export default function HomePage() {
  return (
    <main className={`${wittgenstein.variable} ${geistMono.variable}`}>
      <HeroRevealTriptych />

      <PortfolioIntro />

      <SelectedWorkScroll />

      <PageContactSection />
    </main>
  );
}
