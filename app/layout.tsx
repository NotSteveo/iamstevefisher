import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Absolute base for social images and canonical URLs. NEXT_PUBLIC_SITE_URL
// overrides it (e.g. for a staging domain); local dev stays on localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://iamstevefisher.com");

export const metadata: Metadata = {
  title: { default: "Steve Fisher — Creative Director", template: "%s | Steve Fisher" },
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "./" },
  openGraph: { siteName: "Steve Fisher", type: "website" },
  twitter: { card: "summary_large_image" },
  description:
    "Steve Fisher is a creative director working at the intersection of brand and AI, helping SaaS companies tell better stories, build stronger brands, and create smarter digital experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
