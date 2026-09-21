"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./HeroHeadline.module.css";

export default function HeroHeadline({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    gsap.fromTo(
      words,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.045, delay: 0.15 }
    );
  }, []);

  return (
    <h1 ref={ref} className={`${styles.headline} ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={i} className={styles.mask}>
          <span data-word className={styles.word}>
            {word}
            {i < text.split(" ").length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </h1>
  );
}
