"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FullScreenNav from "./FullScreenNav";
import MenuToggleButton from "./MenuToggleButton";
import styles from "./DarkNav.module.css";

// Same links/logo as HeroRevealTriptych's own sticky nav, but always
// visible rather than fading in once past a hero — there's no hero pin
// here to hide behind.
const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/ai-musings", label: "AI Musings" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function DarkNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={styles.nav}>
        <Link href="/" aria-label="home" className={styles.logoLink}>
          <Image src="/images/logo.svg" alt="Logo" width={24} height={22} />
        </Link>

        {/* Desktop: the inline link row. Mobile: a hamburger opening the
            same FullScreenNav overlay HeroRevealTriptych's own hamburger
            uses — which one is visible is purely a CSS media query
            below. */}
        <nav className={styles.links} aria-label="primary">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
              <Image
                src="/images/hero-reveal/arrow-up-right.svg"
                alt=""
                width={12}
                height={12}
                className={styles.linkIcon}
              />
            </Link>
          ))}
        </nav>

      </div>

      {/* Both rendered outside .nav on purpose — .nav has backdrop-filter,
          which creates a new containing block for position:fixed
          descendants, so a fixed element nested inside it would size/
          position itself against .nav's own small box instead of the
          viewport. MenuToggleButton's own CSS handles hiding it on
          desktop (mobileOnly) — the inline .links row above covers that
          width instead. */}
      <MenuToggleButton
        open={menuOpen}
        onToggle={() => setMenuOpen((o) => !o)}
        className={styles.menuToggle}
      />
      <FullScreenNav open={menuOpen} onClose={() => setMenuOpen(false)} links={LINKS} />
    </>
  );
}
