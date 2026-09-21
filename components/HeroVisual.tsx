"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./HeroVisual.module.css";

// Clean, unbranded product-render angles of the Felix AI mascot Steve
// designed for Quantum Metric. No client wordmark visible in these three.
const ANGLES = [
  "/images/67ff22e2b1a6c242aa45570f_felix_angle_5.jpg", // facing
  "/images/67ff22e2cc4887836c71047e_felix_angle_4.jpg", // angle
  "/images/67ff22e248e223bb30b2adb8_felix_angle_3.jpg", // side
];

export default function HeroVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const frames = Array.from(container.querySelectorAll<HTMLElement>("[data-frame]"));
    if (frames.length === 0) return;

    gsap.set(frames, { autoAlpha: 0 });
    gsap.set(frames[0], { autoAlpha: 1 });

    const tl = gsap.timeline({ repeat: -1, defaults: { duration: 1.1, ease: "power2.inOut" } });
    frames.forEach((frame, i) => {
      const next = frames[(i + 1) % frames.length];
      tl.to(frame, { autoAlpha: 0 }, `+=2.2`).to(next, { autoAlpha: 1 }, "<");
    });

    // gentle idle float, independent of the crossfade
    gsap.to(container, {
      y: 14,
      duration: 3.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(container);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.visual} aria-hidden>
      {ANGLES.map((src) => (
        <div key={src} data-frame className={styles.frame}>
          <Image src={src} alt="" fill sizes="(max-width: 900px) 60vw, 480px" priority />
        </div>
      ))}
    </div>
  );
}
