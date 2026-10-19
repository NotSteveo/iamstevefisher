"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DsEmbed.module.css";

// A live embed of a page template from the Tessera design system (built
// from the DS-Claude project and served as static files under
// /ds-tessera). It's the real React output, not a screenshot: the iframe
// is rendered at a true device width and scaled down to fit the column, so
// the DS's own media queries decide the layout, and the page inside stays
// scrollable and focusable.
const VIEWPORTS = {
  desktop: { label: "Desktop", width: 1280 },
  tablet: { label: "Tablet", width: 820 },
  mobile: { label: "Mobile", width: 390 },
} as const;

type Viewport = keyof typeof VIEWPORTS;
type Theme = "light" | "dark";

const FRAME_HEIGHT = 620;

// The templates include the DS's sample cookie banner, which sits fixed over
// the bottom of the frame and hides the page. The frame is same-origin, and
// the banner mounts after load, so inject a rule rather than hiding a node.
function hideCookieBanner(e: React.SyntheticEvent<HTMLIFrameElement>) {
  try {
    const doc = e.currentTarget.contentDocument;
    if (!doc) return;
    const style = doc.createElement("style");
    style.textContent = '[aria-label="Cookie consent"]{display:none !important}';
    doc.head.appendChild(style);
  } catch {
    /* cross-origin: leave it */
  }
}

export default function DsEmbed({
  template,
  view,
  caption,
  title,
}: {
  template?: string;
  view?: string;
  caption: string;
  title: string;
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [theme, setTheme] = useState<Theme>("light");
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    ro.observe(el);
    setBoxWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const workbench = !template;
  const deviceWidth = workbench ? VIEWPORTS.desktop.width : VIEWPORTS[viewport].width;
  // Never scale up past 1:1; a phone-width frame sits centred in the box.
  const scale = boxWidth ? Math.min(1, boxWidth / deviceWidth) : 1;
  // A template renders alone (and takes ?theme); a view is the workbench itself
  // opened on one of its tabs, which has its own theme switch and no viewport toggle.
  const src = workbench
    ? `/ds-tessera/index.html#${view}`
    : `/ds-tessera/index.html?template=${template}&theme=${theme}`;

  return (
    <figure className={styles.figure}>
      {workbench ? null : <div className={styles.toolbar}>
        <div className={styles.group} role="group" aria-label="Viewport">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => (
            <button
              key={v}
              type="button"
              className={styles.btn}
              aria-pressed={viewport === v}
              onClick={() => setViewport(v)}
            >
              {VIEWPORTS[v].label}
            </button>
          ))}
        </div>
        <div className={styles.group} role="group" aria-label="Theme">
          {(["light", "dark"] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              className={styles.btn}
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
            >
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>}

      <div ref={boxRef} className={styles.stage} style={{ height: FRAME_HEIGHT }}>
        <iframe
          key={src}
          className={styles.frame}
          src={src}
          title={title}
          loading="lazy"
          onLoad={hideCookieBanner}
          style={{
            width: deviceWidth,
            height: FRAME_HEIGHT / scale,
            transform: `scale(${scale})`,
            left: `calc(50% - ${(deviceWidth * scale) / 2}px)`,
          }}
        />
      </div>

      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
