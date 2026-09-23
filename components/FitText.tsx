"use client";

import { useLayoutEffect, useRef } from "react";

// Scales its own font-size so the text fills the wrapping element's width
// (short headings like "Work" don't get there just from a clamp() — a
// four-letter word never reaches "almost full width" off viewport-relative
// sizing alone, since that's tuned for full sentences like the homepage
// bio). Measures the rendered width at a known baseline size, then scales
// by the ratio needed to hit the target — recalculated on resize.
export default function FitText({
  text,
  as: Tag = "h1",
  className,
  fill = 0.98,
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  fill?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;

    const BASELINE = 100;

    function fit() {
      if (!wrap || !el) return;
      el.style.fontSize = `${BASELINE}px`;
      const naturalWidth = el.getBoundingClientRect().width;
      if (naturalWidth === 0) return;
      const targetWidth = wrap.getBoundingClientRect().width * fill;
      el.style.fontSize = `${(BASELINE * targetWidth) / naturalWidth}px`;
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(fit);
    } else {
      fit();
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 100);
    }
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [text, fill]);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      {/* inline-block so the box (and getBoundingClientRect) sizes to the
          glyphs themselves, not the full block width its heading tag
          would otherwise stretch to fill. */}
      <Tag
        ref={textRef as never}
        className={className}
        style={{ display: "inline-block" }}
      >
        {text}
      </Tag>
    </div>
  );
}
