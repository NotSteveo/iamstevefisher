"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import styles from "./RevealText.module.css";

export default function RevealText({
  children,
  as: Tag = "div",
  className = "",
  from = "up",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Direction the element travels in from as it reveals. Defaults to
   * "up" (translateY, the original treatment used by case-study grids). */
  from?: "up" | "left";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fromClass = from === "left" ? styles.fromLeft : "";

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${fromClass} ${visible ? styles.visible : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
