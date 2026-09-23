"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./QuoteSection.module.css";

gsap.registerPlugin(ScrollTrigger);

type Quote = { quote: string; name: string; title: string };

// Placeholder content — swap in real client quotes as they come in. Each
// entry renders as its own row (bordered like SelectedWorkScroll's list),
// so adding more here is the whole change; no layout work needed.
const DEFAULT_QUOTES: Quote[] = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam.",
    name: "Jane Doe",
    title: "VP of Product, Quantum Metric",
  },
];

export default function QuoteSection({
  quotes = DEFAULT_QUOTES,
}: {
  quotes?: Quote[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // The quote holds in the middle of the screen and fades in there — not
  // the usual "rises up from the bottom as you scroll past it" reveal.
  // The section pins for a short scroll distance right as it's reached
  // (its own content is vertically centered via CSS, so pinning at "top
  // top" already puts the quote at screen-middle), with the fade scrubbed
  // across that same short hold, then releases to normal scroll.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rows = Array.from(
      section.querySelectorAll<HTMLElement>("[data-quote-row]"),
    );
    if (rows.length === 0) return;

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;

    // Waits for fonts (same gate SelectedWorkScroll and PortfolioIntro
    // use above this section) before measuring anything scroll-position
    // based — those sections' own pins are still settling their heights
    // at that point, and creating this trigger any earlier bakes in
    // start/end pixel values against a page that's shorter than its
    // final layout, leaving the tween already "complete" by the time a
    // real scroll reaches it.
    const setup = () => {
      if (cancelled) return;
      gsap.set(rows, { opacity: 0 });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 0.2,
          scrub: 0.3,
          pin: true,
        },
      });
      timeline.to(rows, { opacity: 1, ease: "none" });
      tl = timeline;
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(setup);
    } else {
      setup();
    }

    return () => {
      cancelled = true;
      tl?.scrollTrigger?.kill();
      tl?.kill();
    };
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.quotes}>
          {quotes.map((q, i) => (
            <figure className={styles.quoteRow} data-quote-row key={i}>
              <span className={styles.mark} aria-hidden="true">
                “
              </span>
              <blockquote className={styles.quote}>{q.quote}</blockquote>
              <figcaption className={styles.attribution}>
                <span className={styles.name}>{q.name}</span>
                <span className={styles.title}>{q.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
