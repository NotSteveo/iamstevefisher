"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { home, getWorkPage } from "@/lib/content";
import { asset } from "@/lib/assets";
import styles from "./SelectedWorkScroll.module.css";

gsap.registerPlugin(ScrollTrigger);

// Same three leads as the homepage's own curated order — Steve's actual
// credited role on each, not just "Creative Director" by default.
const SELECTED_WORK = [
  {
    href: "/work/quantum-metric-felix-ai-campaign",
    roleLine:
      "Art direction, motion & illustration for Quantum Metric's first AI product launch",
  },
  {
    href: "/work/quantum-metric-leap-2025",
    roleLine:
      "Art direction, motion & video for a 3-day flagship conference in Phoenix",
  },
  {
    href: "/work/quantum-metric-peak-benchmark-report",
    roleLine:
      "Art direction, motion & design for an interactive industry benchmark report",
  },
];

type WorkItem = {
  href: string;
  eyebrow: string;
  title: string;
  roleLine: string;
  // Two images per project per column — one column runs slower, the
  // other faster, so they need enough of their own content each to cover
  // however far their column ends up traveling.
  slowImages: string[];
  fastImages: string[];
};

function buildWorkItems(): WorkItem[] {
  const featured = home.sections.find((s) => s.type === "featured work");
  const projectsByHref = new Map(
    (featured?.projects ?? []).map((p) => [p.href, p]),
  );

  return SELECTED_WORK.map(({ href, roleLine }) => {
    const project = projectsByHref.get(href);
    if (!project) return null;
    const [eyebrow, title] = project.title.includes(" | ")
      ? project.title.split(" | ")
      : ["Quantum Metric", project.title];
    const slug = href.replace(/^\/work\//, "");
    const gallery = getWorkPage(slug)?.images ?? [];
    const images = gallery.slice(0, 4).map((img) => asset(img.url));
    if (images.length < 4) return null;
    return {
      href,
      eyebrow,
      title,
      roleLine,
      slowImages: [images[0], images[1]],
      fastImages: [images[2], images[3]],
    };
  }).filter((w): w is WorkItem => w !== null);
}

// Opacity the non-active list items settle at — dim, not gone, so the
// whole list still reads as one set while one item leads.
const DIM_OPACITY = 0.32;
const HOLD = 1;
const TRANSITION = 0.9;
// How much of the stage's height, at each edge, an image spends fading
// rather than sitting at full opacity — this is what makes entry/exit
// read as a soft fade right at the boundary instead of a hard cut. Kept
// tight on purpose: a card should read as fully there for nearly all of
// its time in the stage, only dipping toward 0 right as it's about to be
// clipped, not for a long stretch beforehand.
const FADE_ZONE_FRACTION = 0.14;

export default function SelectedWorkScroll() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const items = buildWorkItems();

  // Fades the whole section in as it first scrolls into view — a plain
  // IntersectionObserver rather than another ScrollTrigger on this same
  // element, since a second trigger on an element another one is already
  // pinning gets its own start/end miscalculated (the same gotcha
  // HeroRevealTriptych's pin works around).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const wrap = section.querySelector<HTMLElement>("[data-fade-wrap]");
    if (!wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        wrap.classList.add(styles.wrapVisible);
        io.disconnect();
      },
      { threshold: 0.1 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || items.length === 0) return;

    const textEls = Array.from(
      section.querySelectorAll<HTMLElement>("[data-work-item]"),
    );
    const leftCol = section.querySelector<HTMLElement>("[data-left-col]");
    const stage = section.querySelector<HTMLElement>("[data-media-stage]");
    const slowCol = section.querySelector<HTMLElement>(
      '[data-parallax="slow"]',
    );
    const fastCol = section.querySelector<HTMLElement>(
      '[data-parallax="fast"]',
    );
    if (textEls.length === 0 || !stage || !slowCol || !fastCol) return;
    const slowImages = Array.from(
      slowCol.querySelectorAll<HTMLElement>("[data-parallax-image]"),
    );
    const fastImages = Array.from(
      fastCol.querySelectorAll<HTMLElement>("[data-parallax-image]"),
    );

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    let itemClickCleanups: (() => void)[] = [];

    // Per-image opacity, faded by whichever edge is nearer the stage's own
    // top/bottom boundary rather than the image's center — a center-based
    // fade can still read as fully opaque while its near edge has already
    // crossed into overflow:hidden territory, which shows up as a hard,
    // unfaded crop instead of a soft exit. Self-contained (measures the
    // stage fresh each call) so it can run both before and during the pin,
    // not just from the pinned timeline's own onUpdate.
    function updateOpacities() {
      const stageRect = stage!.getBoundingClientRect();
      const fadeZone = stageRect.height * FADE_ZONE_FRACTION;
      [...slowImages, ...fastImages].forEach((img) => {
        const r = img.getBoundingClientRect();
        const top = r.top - stageRect.top;
        const bottom = r.bottom - stageRect.top;
        let o = 1;
        if (top < fadeZone) o = Math.min(o, top / fadeZone);
        if (stageRect.height - bottom < fadeZone)
          o = Math.min(o, (stageRect.height - bottom) / fadeZone);
        img.style.opacity = String(Math.min(1, Math.max(0, o)));
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
    function onApproachScroll() {
      const top = section!.getBoundingClientRect().top - EARLY_FINISH;
      const eased = Math.min(1, Math.max(0, top) / (LAG_DISTANCE - EARLY_FINISH));
      if (leftCol)
        leftCol.style.transform =
          eased > 0 ? `translateY(${eased * LEFT_LAG_PX}px)` : "";
      stage.style.transform =
        eased > 0 ? `translateY(${eased * STAGE_LAG_PX}px)` : "";
      updateOpacities();
    }
    window.addEventListener("scroll", onApproachScroll, { passive: true });
    onApproachScroll();

    const setup = () => {
      if (cancelled) return;

      gsap.set(textEls, { opacity: (i) => (i === 0 ? 1 : DIM_OPACITY) });

      // Each column is a continuous vertical filmstrip, taller than the
      // stage — this is how far it can travel before its own last image
      // settles into place (never further, so nothing runs out early and
      // leaves blank space).
      const stageH = stage.getBoundingClientRect().height;
      const slowTravel = Math.max(0, slowCol.scrollHeight - stageH);
      const fastTravel = Math.max(0, fastCol.scrollHeight - stageH);

      function applyProgress(rawP: number) {
        // Both columns move at the same rate — the brick-offset look
        // (fastCol's own CSS top:14%) still reads as two columns, but
        // without a relative speed difference between them, which
        // otherwise looks like the two are racing rather than one
        // cohesive filmstrip. The text list stays completely put once
        // pinned — only the images carry the motion from here on.
        gsap.set(slowCol, { y: -rawP * slowTravel });
        gsap.set(fastCol, { y: -rawP * fastTravel });
        updateOpacities();
      }

      gsap.set([slowCol, fastCol], { y: 0 });
      updateOpacities();

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.3,
          scrub: 0.4,
          pin: true,
          anticipatePin: 1,
          // A true scroll-linked filmstrip, not a discrete swap: both
          // columns move together on every tick (holds included).
          onUpdate: (self) => applyProgress(self.progress),
        },
      });
      tl = timeline;

      // Text crossfade only — which project "leads" is still a set of
      // discrete beats (matches the list reading like distinct entries,
      // not a continuous blend), independent of the images' continuous
      // scroll above.
      const holdStartTimes: number[] = [];
      let cursor = 0;
      items.forEach((_, i) => {
        holdStartTimes.push(cursor);
        cursor += HOLD;
        if (i === items.length - 1) return;
        const t = cursor;
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
        cursor += TRANSITION;
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

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(setup);
    } else {
      setup();
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
                    className={styles.item}
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
                    <p className={styles.roleLine}>{item.roleLine}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.mediaStage} data-media-stage>
              <div className={styles.parallaxCol} data-parallax="slow">
                {items.flatMap((item) =>
                  item.slowImages.map((src, j) => (
                    <div
                      className={styles.mediaImage}
                      data-parallax-image
                      key={`${item.href}-slow-${j}`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 45vw, 22vw"
                        className={styles.mediaImg}
                      />
                    </div>
                  )),
                )}
              </div>
              <div
                className={`${styles.parallaxCol} ${styles.parallaxColOffset}`}
                data-parallax="fast"
              >
                {items.flatMap((item) =>
                  item.fastImages.map((src, j) => (
                    <div
                      className={styles.mediaImage}
                      data-parallax-image
                      key={`${item.href}-fast-${j}`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 45vw, 22vw"
                        className={styles.mediaImg}
                      />
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
