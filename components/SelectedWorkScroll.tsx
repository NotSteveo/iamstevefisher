"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { home, getWorkPage } from "@/lib/content";
import { asset } from "@/lib/assets";
import styles from "./SelectedWorkScroll.module.css";

gsap.registerPlugin(ScrollTrigger);

// Same leads as the homepage's own curated order — Steve's actual
// credited role on each, not just "Creative Director" by default.
const SELECTED_WORK = [
  { href: "/work/quantum-metric-leap-2026" },
  { href: "/work/quantum-metric-web-design" },
  { href: "/work/adobe-workfront-web-design" },
];

type Tile = {
  caption: string;
  // Crossfaded through, in order, as the tile travels up the stage (see
  // updateOpacities).
  images: { src: string; pos?: string }[];
};

type WorkItem = {
  href: string;
  eyebrow: string;
  title: string;
  blurb?: string;
  tiles: Tile[];
  rowPattern: number[];
};

function buildWorkItems(): WorkItem[] {
  const featured = home.sections.find((s) => s.type === "featured work");
  const projectsByHref = new Map(
    (featured?.projects ?? []).map((p) => [p.href, p]),
  );

  return SELECTED_WORK.map(({ href }): WorkItem | null => {
    const project = projectsByHref.get(href);
    if (!project) return null;
    const [eyebrow, title] = project.title.includes(" | ")
      ? project.title.split(" | ")
      : ["Quantum Metric", project.title];
    const slug = href.replace(/^\/work\//, "");
    const page = getWorkPage(slug);
    const tiles = (page?.selectedTiles ?? []).map((t) => ({
      caption: t.caption,
      images: t.images.map((img) =>
        typeof img === "string" ? { src: asset(img) } : { src: asset(img.src), pos: img.pos },
      ),
    }));
    if (tiles.length === 0) return null;
    return {
      href,
      eyebrow,
      title,
      blurb: page?.selectedBlurb,
      tiles,
      rowPattern: page?.selectedRowPattern ?? ROW_PATTERN,
    };
  }).filter((w): w is WorkItem => w !== null);
}

// Tiles are laid out in rows, in order: a pair of squares, one wide frame,
// then another pair, repeating. A row's shape (width, aspect ratio) comes
// from how many tiles it holds.
const ROW_PATTERN = [2, 1, 2];

function toRows(count: number, pattern: number[]): number[][] {
  const rows: number[][] = [];
  let next = 0;
  for (let r = 0; next < count; r++) {
    const size = Math.min(pattern[r % pattern.length], count - next);
    rows.push(Array.from({ length: size }, (_, k) => next + k));
    next += size;
  }
  return rows;
}
// Peak blur (px) a variant passes through as it dissolves into the next.
const MAX_BLUR = 16;
// How much of the tile's journey (0-1) each side of a swap point it spends dissolving.
const SWAP_HALF_WIDTH = 0.1;

// Opacity the non-active list items settle at — dim, not gone, so the
// whole list still reads as one set while one item leads.
const DIM_OPACITY = 0.32;
const HOLD = 1;
const TRANSITION = 0.9;
// A tile's opacity and scale follow an upside-down U across the stage: 0 and
// SCALE_MIN as its center enters at the bottom, full at the stage's vertical
// middle, back to 0 and SCALE_MIN leaving through the top. FADE_MARGIN pushes
// the zero points slightly past the stage edges (as a share of its height)
// so a tile is already invisible by the time its center reaches an edge.
const SCALE_MIN = 0.75;
const FADE_MARGIN = 0.05;

export default function SelectedWorkScroll() {
  const sectionRef = useRef<HTMLElement | null>(null);
  // buildWorkItems() reads only static content, but returns a fresh array
  // every call — without this memo, items is a new reference on every
  // render, and the main effect below (keyed on [items]) tears down and
  // rebuilds the whole pinned ScrollTrigger any time activeIndex changes
  // (its own setActiveIndex triggers exactly that re-render), which is
  // what was flashing the footer mid-scroll: the section briefly unpins
  // during that kill/recreate cycle.
  const items = useMemo(() => buildWorkItems(), []);
  // Below 900px the list stacks above the media stage (see the CSS media
  // query) — showing all three full text blocks there at once is what was
  // pushing the images down out of the pinned section entirely. Only the
  // active item renders there, sized down to one item instead of three, and
  // synced to the same crossfade driving the desktop dim/bright treatment
  // (see the ref mirror below) rather than a second, separately-timed
  // thing.
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || items.length === 0) return;

    const textEls = Array.from(
      section.querySelectorAll<HTMLElement>("[data-work-item]"),
    );
    const wrap = section.querySelector<HTMLElement>("[data-fade-wrap]");
    const leftCol = section.querySelector<HTMLElement>("[data-left-col]");
    const stage = section.querySelector<HTMLElement>("[data-media-stage]");
    // One continuous filmstrip, not two independently-scrolling columns —
    // two columns moving at their own speeds drift relative to each other
    // over the course of a scroll, and since each image needs to be large
    // (see .mediaImage's width) to read as filling its own frame rather
    // than being squeezed into a fixed 50/50 half, that drift meant a
    // slow- and fast-column image could end up overlapping at some scroll
    // position no matter how carefully the sizes were tuned. A single
    // filmstrip's images stay in one fixed relative order/spacing the
    // whole time — alternating left/right (see .mediaImage:nth-child)
    // still reads as a zigzag cascade, but two images can never occupy
    // the same vertical slice, so there's nothing left to overlap.
    const filmstrip = section.querySelector<HTMLElement>(
      '[data-parallax="filmstrip"]',
    );
    if (textEls.length === 0 || !stage || !filmstrip || !wrap) return;
    const filmstripImages = Array.from(
      filmstrip.querySelectorAll<HTMLElement>("[data-parallax-image]"),
    );

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    let itemClickCleanups: (() => void)[] = [];

    // Per-tile opacity and scale, driven by where the tile's center sits in the
    // stage (see FADE_MARGIN above). Self-contained (measures the stage fresh
    // each call) so it can run both before and during the pin, not just from
    // the pinned timeline's own onUpdate.
    function updateOpacities() {
      const stageRect = stage!.getBoundingClientRect();
      filmstripImages.forEach((img) => {
        // Measure the row, not the tile: the tile itself is scaled below, and
        // reading its own scaled rect would feed back into this fade.
        const r = (img.parentElement ?? img).getBoundingClientRect();
        const top = r.top - stageRect.top;
        const bottom = r.bottom - stageRect.top;
        const center = (top + bottom) / 2;
        const u = (1 - center / stageRect.height + FADE_MARGIN) / (1 + 2 * FADE_MARGIN);
        const o = Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
        const fade = Math.min(1, Math.max(0, o));
        img.style.opacity = String(fade);
        // Scale rides the same curve: SCALE_MIN at the ends, 1 in the middle.
        img.style.transform = `translateZ(0) scale(${(SCALE_MIN + (1 - SCALE_MIN) * fade).toFixed(4)})`;

        // Content swap: as the tile travels up the stage (u: 0 entering, 1
        // leaving) it dissolves through its variants with a blur between
        // them. Swaps are placed in the entering/leaving thirds, never at the
        // middle, so a tile is always sharp and settled while it's at full
        // size.
        const variants = img.querySelectorAll<HTMLElement>("[data-variant]");
        const n = variants.length;
        if (n > 1) {
          const centers = n === 2 ? [0.76] : n === 3 ? [0.3, 0.7] : Array.from({ length: n - 1 }, (_, k) => 0.22 + (0.56 * k) / (n - 2));
          const ts = centers.map((c) => {
            const x = Math.min(1, Math.max(0, (u - (c - SWAP_HALF_WIDTH)) / (SWAP_HALF_WIDTH * 2)));
            return x * x * (3 - 2 * x);
          });
          variants.forEach((v, i) => {
            const inT = i > 0 ? ts[i - 1] : 1;
            const outT = i < n - 1 ? ts[i] : 0;
            v.style.opacity = String(Math.max(0, inT - outT));
            const blur = MAX_BLUR * Math.max(outT, i > 0 ? 1 - inT : 0);
            v.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : "";
          });
        }
      });
    }

    // Pre-pin lag: the section's content trails slightly behind normal page
    // scroll as it approaches, catching up to rest right as the pin
    // engages — reads as the section getting "caught" by the pin rather
    // than just appearing already locked in place. The right side (images)
    // lags less than the left (text), i.e. moves faster / catches up
    // sooner, so the two visibly drift apart during the approach instead
    // of moving as one inert block — real parallax, not just a delayed
    // arrival. Both still resolve to 0 together (same eased curve, just
    // different peak offsets) so neither hands off to the pin later than
    // the other.
    const LAG_DISTANCE = window.innerHeight * 0.9;
    const LEFT_LAG_PX = 120;
    const STAGE_LAG_PX = 70;
    // Resolves to 0 a little before top actually reaches 0, not exactly at
    // it — anticipatePin can lock the pin in slightly ahead of that exact
    // point, and if our own offset hadn't fully settled yet by then, the
    // leftover pixels would visibly snap away on the next tick instead of
    // the two handing off cleanly.
    const EARLY_FINISH = 60;
    // How far into the approach (as a fraction of eased, 1 = just
    // starting, 0 = about to pin) .left waits before it starts revealing
    // — the scroll-distance equivalent of the old CSS transition-delay,
    // so the list still arrives a beat after the images rather than at
    // the exact same instant.
    const LEFT_FADE_START = 0.55;
    // Replaces a separate IntersectionObserver + CSS-transition fade-in.
    // That was wall-clock timed (0.8s) against a trigger point that in
    // practice left as little as ~800px of scroll before the pin
    // engages — enough real time on a slow scroll, but a normal-speed
    // scroll could reach the pin before the transition finished, reading
    // as the image still visibly dim right as it locked in and then
    // "catching up" a moment later. Driving opacity off the same eased
    // approach progress as the lag transforms below instead means it's
    // always fully resolved by the exact moment the pin engages (eased
    // reaches 0), regardless of how fast the user scrolled to get there.
    //
    // Only handles the approach from above — once scrolled past the pin's
    // own end, the section unpins and returns to normal document flow for
    // the rest of its own 100vh box's height (~one viewport of scroll)
    // before the next section replaces it. A version of this that also
    // faded `wrap` out on that far side (to avoid the frozen last pin
    // frame's top sliver passing under the fixed nav) was tried and
    // reverted: fully fading by the time the content reached the nav (a
    // ~40-56px window) left the remaining ~600+px of that exit scroll
    // showing nothing but the section's own solid background — a much
    // worse regression than the sliver it was meant to fix. The nav
    // itself is already 92%-opaque with a blur (see .stickyNav in
    // HeroRevealTriptych.module.css), so in practice that sliver reads as
    // a faint blurred ghost, not a hard cut.
    function onApproachScroll() {
      const top = section!.getBoundingClientRect().top - EARLY_FINISH;
      const eased = Math.min(1, Math.max(0, top) / (LAG_DISTANCE - EARLY_FINISH));
      wrap!.style.opacity = String(1 - eased);
      if (leftCol) {
        leftCol.style.transform =
          eased > 0 ? `translateY(${eased * LEFT_LAG_PX}px)` : "";
        const leftProgress =
          eased >= LEFT_FADE_START ? 0 : 1 - eased / LEFT_FADE_START;
        leftCol.style.opacity = String(leftProgress);
      }
      stage!.style.transform =
        eased > 0 ? `translateY(${eased * STAGE_LAG_PX}px)` : "";
      updateOpacities();
    }
    window.addEventListener("scroll", onApproachScroll, { passive: true });
    onApproachScroll();

    const setup = () => {
      if (cancelled) return;

      gsap.set(textEls, { opacity: (i) => (i === 0 ? 1 : DIM_OPACITY) });

      // The filmstrip is taller than the stage — this is how far it can
      // travel before its last image settles into place (never further,
      // so nothing runs out early and leaves blank space).
      const stageH = stage.getBoundingClientRect().height;
      const travel = Math.max(0, filmstrip.scrollHeight - stageH);

      function applyProgress(rawP: number) {
        // The text list stays completely put once pinned — only the
        // images carry the motion from here on.
        gsap.set(filmstrip, { y: -rawP * travel });
        updateOpacities();
      }

      gsap.set(filmstrip, { y: 0 });
      updateOpacities();

      // Text crossfade timing, computed upfront (purely from HOLD/
      // TRANSITION/item count, nothing scroll-dependent) so both the
      // timeline below and activeIndex (see onUpdate) read the exact same
      // schedule — one deterministic source, not two separately-timed
      // things that can drift out of sync with each other.
      const holdStartTimes: number[] = [];
      let cursor = 0;
      items.forEach((_, i) => {
        holdStartTimes.push(cursor);
        cursor += HOLD;
        if (i === items.length - 1) return;
        cursor += TRANSITION;
      });

      // Which item is "active" (opacity 1 on desktop, the only one shown
      // at all on mobile — see activeIndex/.itemActive) for a given point
      // in the timeline: item i owns everything up through the end of its
      // own hold, i.e. right up until its own transition-away starts.
      // Tried deriving this from which image is actually nearest the
      // stage center instead, so mobile's single-item view would track
      // the real images rather than this fixed schedule — but that's a
      // per-frame comparison across several moving images, and it does
      // occasionally flicker between two items for a frame or two right
      // at their handoff (worse than this schedule ever being a beat
      // ahead of the images, which is what it trades for).
      function indexForTime(rawTime: number): number {
        for (let i = 0; i < items.length - 1; i++) {
          if (rawTime < holdStartTimes[i] + HOLD) return i;
        }
        return items.length - 1;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.3,
          scrub: 0.4,
          pin: true,
          anticipatePin: 1,
          // A true scroll-linked filmstrip, not a discrete swap: the
          // images move on every tick (holds included).
          onUpdate: (self) => {
            applyProgress(self.progress);
            const rawTime = self.progress * cursor;
            const idx = indexForTime(rawTime);
            if (idx !== activeIndexRef.current) {
              activeIndexRef.current = idx;
              setActiveIndex(idx);
            }
          },
        },
      });
      tl = timeline;

      // Text crossfade only — which project "leads" is still a set of
      // discrete beats (matches the list reading like distinct entries,
      // not a continuous blend), independent of the images' continuous
      // scroll above.
      items.forEach((_, i) => {
        if (i === items.length - 1) return;
        const t = holdStartTimes[i] + HOLD;
        timeline
          .to(
            textEls[i],
            { opacity: DIM_OPACITY, duration: TRANSITION, ease: "power2.out" },
            t,
          )
          .to(
            textEls[i + 1],
            { opacity: 1, duration: TRANSITION, ease: "power2.out" },
            t,
          );
      });

      // Click a row (anywhere except its own links, which navigate as
      // normal) to jump the scroll position straight to that project's
      // hold — the list becomes a real chapter index, not just a display.
      // An instant jump, not native smooth scrolling: the browser's own
      // smooth-scroll fires a long run of intermediate scroll events that
      // fight with this same pin's scrubbed ScrollTrigger, leaving it in
      // an unstable, sometimes wildly-off position.
      const totalDuration = timeline.duration();
      itemClickCleanups = textEls.map((el, i) => {
        function onClick(e: MouseEvent) {
          if ((e.target as HTMLElement).closest("a")) return;
          const trigger = timeline.scrollTrigger;
          if (!trigger || !totalDuration) return;
          // Middle of the hold, not its very start — lands solidly inside
          // the active window instead of right on its boundary.
          const targetProgress =
            (holdStartTimes[i] + HOLD / 2) / totalDuration;
          const targetY =
            trigger.start + targetProgress * (trigger.end - trigger.start);
          window.scrollTo({ top: targetY });
        }
        el.addEventListener("click", onClick);
        return () => el.removeEventListener("click", onClick);
      });
    };

    // Two rAFs, not a direct call off fonts.ready — HeroRevealTriptych's own
    // pinned ScrollTrigger (above this section in the DOM) defers its own
    // creation the same way, so its pin-spacer isn't in the document yet
    // the instant fonts.ready resolves. Creating this section's pin
    // synchronously at that point measures/locks in a start position from
    // before that spacer exists, which is short by however tall the
    // spacer ends up — matching Hero's own deferred timing here keeps both
    // pins created in the same relative order they always were.
    const runSetup = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setup();
        });
      });
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(runSetup);
    } else {
      runSetup();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onApproachScroll);
      itemClickCleanups.forEach((fn) => fn());
      tl?.scrollTrigger?.kill();
      tl?.kill();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <>
      <section className={styles.section} ref={sectionRef}>
        <div className={styles.wrap} data-fade-wrap>
          <div className={styles.grid}>
            <div className={styles.left} data-left-col>
              <div className={styles.headingRow}>
                <h2 className={styles.heading}>Selected work</h2>
                <Link href="/work" className={styles.viewAllLink}>
                  View all work
                  <Image
                    src="/images/hero-reveal/arrow-up-right.svg"
                    alt=""
                    width={12}
                    height={12}
                  />
                </Link>
              </div>
              <div className={styles.list}>
                {items.map((item, i) => (
                  <div
                    className={`${styles.item} ${i === activeIndex ? styles.itemActive : ""}`}
                    data-work-item={i}
                    key={item.href}
                  >
                    <div className={styles.itemTop}>
                      <span className={styles.eyebrow}>{item.eyebrow}</span>
                      <Link href={item.href} className={styles.viewLink}>
                        View the project
                        <Image
                          src="/images/hero-reveal/arrow-up-right.svg"
                          alt=""
                          width={12}
                          height={12}
                        />
                      </Link>
                    </div>
                    <Link href={item.href} className={styles.title}>
                      {item.title}
                    </Link>
                    {item.blurb ? <p className={styles.blurb}>{item.blurb}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.mediaStage} data-media-stage>
              <div className={styles.filmstrip} data-parallax="filmstrip">
                {items.reduce<{ rows: React.ReactNode[]; rowCount: number }>(
                  (acc, item, itemIndex) => {
                    toRows(item.tiles.length, item.rowPattern).forEach((row, r) => {
                      const rowIndex = acc.rowCount++;
                      const pair = row.length > 1;
                      acc.rows.push(
                        <div
                          key={`${item.href}-row-${r}`}
                          className={`${styles.row} ${pair ? styles.rowPair : styles.rowSingle} ${
                            rowIndex % 2 === 0 ? styles.rowLeft : styles.rowRight
                          } ${r === 0 && itemIndex > 0 ? styles.projectStart : ""}`}
                        >
                          {row.map((j) => (
                            <div
                              className={styles.mediaImage}
                              data-parallax-image
                              data-item-index={itemIndex}
                              key={`${item.href}-${j}`}
                            >
                              {item.tiles[j].images.map((img, v) => (
                                <div
                                  className={styles.variant}
                                  data-variant
                                  key={v}
                                  style={{ opacity: v === 0 ? 1 : 0 }}
                                >
                                  <Image
                                    src={img.src}
                                    alt=""
                                    fill
                                    sizes="(max-width: 900px) 60vw, 45vw"
                                    className={styles.mediaImg}
                                    style={img.pos ? { objectPosition: img.pos } : undefined}
                                  />
                                </div>
                              ))}
                              <span className={styles.caption}>{item.tiles[j].caption}</span>
                            </div>
                          ))}
                        </div>,
                      );
                    });
                    return acc;
                  },
                  { rows: [], rowCount: 0 },
                ).rows}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
