"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./FullScreenNav.module.css";

type NavLink = { href: string; label: string };

// Shared full-screen menu overlay opened by the hamburger buttons in both
// HeroRevealTriptych's own topNav and DarkNav's mobile trigger — same look
// either way, so it only needs building (and fixing) once. No close button
// of its own — MenuToggleButton (rendered by whichever parent owns the
// open state) sits fixed above this overlay's z-index and handles that,
// staying the same element throughout so it can morph into an X instead
// of being swapped for a separate icon.
export default function FullScreenNav({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}) {
  // Locks background scroll while the overlay covers the screen — without
  // this the page underneath keeps scrolling right along with any touch
  // drag on the menu itself.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.topRow}>
        <Image src="/images/logo.svg" alt="Logo" width={28} height={26} />
      </div>

      <nav className={styles.linksList} aria-label="primary">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
