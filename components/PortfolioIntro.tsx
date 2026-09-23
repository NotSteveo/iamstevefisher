"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import QuantumMetricTooltip from "./QuantumMetricTooltip";
import AIStackTooltip from "./AIStackTooltip";
import GhostHighlight from "./GhostHighlight";
import styles from "./PortfolioIntro.module.css";

gsap.registerPlugin(ScrollTrigger);

const BIO =
  "Working at the intersection of brand, AI. Over the last 13+ years, I’ve helped SaaS companies tell better stories, produce beautiful campaigns, build distinct brand identities, and design smarter digital experiences from zero to scale.";

// Tenure at Quantum Metric, not the homepage's own "Creative Director /
// Remote" version — this page already states the role up top, so this
// line only needs to say how long.
const QUANTUM_METRIC_START = new Date(2021, 6, 1); // July 2021
function tenureAtQuantumMetric(): string {
  const now = new Date();
  let months =
    (now.getFullYear() - QUANTUM_METRIC_START.getFullYear()) * 12 +
    (now.getMonth() - QUANTUM_METRIC_START.getMonth());
  if (now.getDate() < QUANTUM_METRIC_START.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearsPart = `${years} year${years === 1 ? "" : "s"}`;
  const monthsPart =
    remainingMonths > 0
      ? ` and ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`
      : "";
  return `${yearsPart}${monthsPart}`;
}

// Highlighted independently (not as one "13+ years" phrase) because a
// narrower column can break the real rendered line right between them —
// matching per-word still highlights correctly on either side of that
// break.
const HIGHLIGHT_WORDS = ["13+", "years"];
const HIGHLIGHT_PATTERN = new RegExp(
  `(${HIGHLIGHT_WORDS.map((w) => w.replace(/[+]/g, "\\+")).join("|")})`,
  "g",
);

// Split into sentences so each can reveal as its own scroll-scrubbed
// "line" — there's no SplitText plugin here to break on actual rendered
// line boundaries, so a sentence is the most honest unit available.
function sentences(text: string): string[] {
  return text
    .split(". ")
    .map((s, i, arr) => (i < arr.length - 1 ? `${s}.` : s))
    .filter(Boolean);
}

// Wraps each HIGHLIGHT_WORDS match in a rendered line's plain text in the
// brand green — runs per-line (not once on the whole sentence) since a
// line can contain either word, both, or neither. Also where the little
// hover ghost lives (see GhostHighlight) — same words, since "13+ years"
// is the bit this is winking at.
function withHighlight(text: string): ReactNode {
  const parts = text.split(HIGHLIGHT_PATTERN);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    HIGHLIGHT_WORDS.includes(part) ? (
      <span className={styles.highlight} key={i}>
        <GhostHighlight text={part} />
      </span>
    ) : (
      part
    ),
  );
}

// Drops the little footnote asterisk right after "AI" — matched as a
// whole word (not e.g. the "ai" inside another word) since this only
// ever runs on the lead sentence, where "AI" appears exactly once.
function withAsterisk(text: string): ReactNode {
  const match = /\bAI\b/.exec(text);
  if (!match) return text;
  const end = match.index + match[0].length;
  return (
    <>
      {text.slice(0, end)}
      <AIStackTooltip />
      {text.slice(end)}
    </>
  );
}

export default function PortfolioIntro() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  // The real rendered line breaks for each bio sentence, measured from the
  // DOM — there's no SplitText plugin here, so the only honest way to
  // reveal "a line at a time" is to lay the words out once, see where the
  // browser actually wrapped them, then re-render each line as its own
  // masked block. Null until that first measuring pass has run.
  const [bioLines2D, setBioLines2D] = useState<string[][] | null>(null);

  const tenure = tenureAtQuantumMetric();
  const bioLines = sentences(BIO);

  // Pass 1: measure. Each bio sentence first renders as plain text (see
  // the ternary below); a Range walked character-by-character over that
  // text node reports the real line the browser broke it onto — using
  // getClientRects() on the actual rendered text instead of approximating
  // from separate word spans, which don't reproduce the same
  // letter-spacing/kerning as one continuous run and were mis-measuring
  // where lines actually broke. Re-runs on resize since a narrower/wider
  // column changes where those breaks fall.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function linesFromText(el: HTMLElement): string[] | null {
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null;
      const text = textNode.textContent ?? "";
      if (!text) return null;
      const range = document.createRange();
      const lines: string[] = [];
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
          lines.push(text.slice(lineStart, i).trim());
          lineStart = i;
          lineTop = top;
        }
      }
      lines.push(text.slice(lineStart).trim());
      return lines.filter(Boolean);
    }

    function measure() {
      const paras = Array.from(
        section!.querySelectorAll<HTMLElement>("[data-bio-para]"),
      );
      if (paras.length === 0) return;
      const grouped = paras.map((p) => linesFromText(p));
      // Dev StrictMode runs this effect twice — if the first call has
      // already swapped the DOM to line-mode, the second finds masked
      // spans instead of a plain text node and bails per-paragraph.
      // Skip the whole update rather than clobbering good state.
      if (grouped.some((g) => g === null)) return;
      setBioLines2D(grouped as string[][]);
    }

    // Reading rects before the mono font has swapped in measures the
    // fallback font's metrics — the resulting line groupings then don't
    // match once the real font renders. Same fix as the hero's own
    // font-loading race.
    if (!bioLines2D) {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready.then(measure);
      } else {
        measure();
      }
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      // Drop back to plain-text mode so the next measure pass sees a
      // fresh text node instead of the old (now stale) line groupings.
      resizeTimer = setTimeout(() => setBioLines2D(null), 150);
    }
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [bioLines2D]);

  // Pass 2: once real lines are known, reveal them one at a time — a
  // fade paired with the same rising-into-place motion as the hero
  // headline's letters, each line clearly finishing before the next
  // starts rather than all arriving in one compressed burst.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !bioLines2D) return;
    const lines = Array.from(
      section.querySelectorAll<HTMLElement>("[data-reveal-line]"),
    );
    if (lines.length === 0) return;
    // The lead sentence's own lines, specifically — they start white like
    // everything else, then fade to gray once the second paragraph starts
    // taking its turn (see the color tween below), handing the emphasis
    // off instead of both reading as equally prominent forever.
    const leadLines = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-bio-para="0"] [data-reveal-line]',
      ),
    );

    const STAGGER = 0.5;
    const DURATION = 1;

    gsap.set(lines, { yPercent: 60, opacity: 0 });
    if (leadLines.length > 0) gsap.set(leadLines, { color: "#ffffff" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        // Starts as the section is still entering from the bottom of the
        // viewport (not once it's already centered) so the reveal feels
        // connected to the tail end of the hero above it, not like a
        // separate beat that only starts once you've fully arrived — and
        // runs across roughly a full viewport of scroll so each line's
        // turn is long enough to actually read as its own beat.
        start: "top bottom",
        end: () => "+=" + window.innerHeight * 1.2,
        scrub: 0.6,
      },
    });
    tl.to(lines, {
      yPercent: 0,
      opacity: 1,
      stagger: STAGGER,
      duration: DURATION,
      ease: "power2.out",
    });
    if (leadLines.length > 0) {
      // Lands at the same timeline position the first line of the second
      // paragraph starts at (index leadLines.length within the stagger
      // above) — the handoff happens exactly as the next line arrives,
      // not on some separate schedule.
      tl.to(
        leadLines,
        { color: "#b3b3b3", duration: DURATION, ease: "power2.out" },
        leadLines.length * STAGGER,
      );
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [bioLines2D]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.wrap}>
        <div className={styles.column}>
          {bioLines.map((sentence, i) => (
            <p
              className={i === 0 ? styles.lead : styles.bio}
              key={i}
              data-bio-para={i}
            >
              {bioLines2D
                ? bioLines2D[i].map((lineText, j) => (
                    <span className={styles.lineMask} key={j}>
                      <span className={styles.revealInner} data-reveal-line>
                        {i === 0
                          ? withAsterisk(lineText)
                          : withHighlight(lineText)}
                      </span>
                    </span>
                  ))
                : sentence}
            </p>
          ))}
          <p className={styles.current}>
            <span className={styles.revealInner} data-reveal-line>
              Currently @ <QuantumMetricTooltip /> / {tenure}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
