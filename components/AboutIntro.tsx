"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about } from "@/lib/content";
import styles from "./AboutIntro.module.css";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE =
  (about.sections.find((s) => s.type === "hero headline")?.text as string) ??
  "It all started with a pirated version of Photoshop 20 years ago.";

// Same "big bold text" treatment as the homepage bio (PortfolioIntro): the
// real rendered line breaks are measured from the DOM once, then each line
// re-renders as its own masked block that reveals on scroll — the only
// honest way to do this without a SplitText plugin.
export default function AboutIntro() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<string[] | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function linesFromText(el: HTMLElement): string[] | null {
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null;
      const text = textNode.textContent ?? "";
      if (!text) return null;
      const range = document.createRange();
      const result: string[] = [];
      let lineStart = 0;
      let lineTop: number | null = null;
      for (let i = 0; i < text.length; i++) {
        range.setStart(textNode, i);
        range.setEnd(textNode, i + 1);
        const rect = range.getClientRects()[0];
        if (!rect) continue;
        const top = Math.round(rect.top);
        if (lineTop === null) {
          lineTop = top;
        } else if (top !== lineTop) {
          result.push(text.slice(lineStart, i).trim());
          lineStart = i;
          lineTop = top;
        }
      }
      result.push(text.slice(lineStart).trim());
      return result.filter(Boolean);
    }

    function measure() {
      const para = section!.querySelector<HTMLElement>("[data-intro-para]");
      if (!para) return;
      const measured = linesFromText(para);
      // Dev StrictMode runs this twice — the second pass finds masked
      // spans instead of a plain text node and bails, same as
      // PortfolioIntro's own measuring effect.
      if (measured === null) return;
      setLines(measured);
    }

    if (!lines) {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready.then(measure);
      } else {
        measure();
      }
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setLines(null), 150);
    }
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [lines]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !lines) return;
    const lineEls = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal-line]"),
    );
    if (lineEls.length === 0) return;

    gsap.set(lineEls, { yPercent: 60, opacity: 0 });

    const tl = gsap.to(lineEls, {
      yPercent: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "top 20%",
        scrub: 0.6,
      },
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [lines]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.wrap}>
        <p className={styles.lead} data-intro-para>
          {lines
            ? lines.map((line, i) => (
                <span className={styles.lineMask} key={i}>
                  <span className={styles.revealInner} data-reveal-line>
                    {line}
                  </span>
                </span>
              ))
            : HEADLINE}
        </p>
      </div>
    </section>
  );
}
