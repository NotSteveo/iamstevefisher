import type { Metadata } from "next";
import { Inter, Outfit, Overpass_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const overpassMono = Overpass_Mono({
  variable: "--font-overpass-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "I am Steve Fisher - Art Direction, Motion Design, Web Design, and more.",
  description:
    "Steve Fisher is a creative director working at the intersection of brand and AI, helping SaaS companies tell better stories, build stronger brands, and create smarter digital experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${overpassMono.variable}`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
