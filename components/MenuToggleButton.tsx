"use client";

import styles from "./MenuToggleButton.module.css";

// The same three lines the whole time — open just toggles a class that
// morphs them into an X via CSS transitions, rather than swapping to a
// separate close icon (which can't animate between the two since they'd
// be different elements). Fixed-positioned so it sits in one consistent
// spot on screen regardless of which nav (HeroRevealTriptych's topNav or
// DarkNav) renders it, or whether FullScreenNav's overlay is now covering
// everything beneath it.
export default function MenuToggleButton({
  open,
  onToggle,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.button} ${open ? styles.open : ""} ${className ?? ""}`}
      aria-label={open ? "Close menu" : "Menu"}
      onClick={onToggle}
    >
      <span className={styles.line} />
      <span className={styles.line} />
      <span className={styles.line} />
    </button>
  );
}
