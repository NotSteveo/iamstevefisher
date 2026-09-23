"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "./AIStackTooltip.module.css";

const STACK = [
  { name: "Figma", icon: "/images/logos/figma.svg" },
  { name: "Claude", icon: "/images/logos/claude.svg" },
  { name: "GitHub", icon: "/images/logos/github.svg" },
  { name: "Vercel", icon: "/images/logos/vercel.svg" },
];

const GAP = 12;

// A little footnote joke on "AI" — hover it for the actual toolchain.
export default function AIStackTooltip() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const markRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = markRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.top - GAP, left: rect.left + rect.width / 2 });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <span
      className={styles.root}
      ref={rootRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={styles.mark} ref={markRef} aria-hidden="true">
        *
      </span>

      {open &&
        mounted &&
        position &&
        createPortal(
          <div
            ref={tooltipRef}
            className={styles.tooltip}
            style={{ top: position.top, left: position.left }}
            role="tooltip"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div className={styles.stack}>
              {STACK.map((tool, i) => (
                <span className={styles.step} key={tool.name}>
                  <Image
                    src={tool.icon}
                    alt=""
                    width={16}
                    height={16}
                    className={styles.icon}
                  />
                  {tool.name}
                  {i < STACK.length - 1 && (
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
            <p className={styles.caption}>How I built this site</p>
          </div>,
          document.body,
        )}
    </span>
  );
}
