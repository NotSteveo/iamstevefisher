"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FullScreenNav from "./FullScreenNav";
import MenuToggleButton from "./MenuToggleButton";
import styles from "./HeroRevealTriptych.module.css";

gsap.registerPlugin(ScrollTrigger);

type Panel = { src: string; word: string; variant: "sans" | "serif" | "mono" };

const PANELS: Panel[] = [
  {
    src: "/videos/hero-reveal/make-oil-wave.mp4",
    word: "Make",
    variant: "sans",
  },
  { src: "/videos/hero-reveal/it-frost.mp4", word: "it", variant: "serif" },
  {
    src: "/videos/hero-reveal/possible-lights.mp4",
    word: "possible.",
    variant: "mono",
  },
];

const HEADLINE = "I am Steve Fisher.";

const FOOTER_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/ai-musings", label: "AI Musings" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Trimmed by 8px (a third of the two 12px row gaps) so the three widths
// plus the gaps between them sum to exactly 100% instead of overflowing
// the row by 24px.
const ACTIVE_WIDTH = "calc(92% - 8px)";
const COLLAPSED_WIDTH = "calc(4% - 8px)";

// .topNav is absolutely positioned (24px padding + the logo's own height),
// not part of layout flow, so nothing else naturally avoids it — this is
// how much room the final "possible." box leaves above itself for it.
const TOP_NAV_CLEARANCE = 90;

export default function HeroRevealTriptych() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const headlineLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const headlineLinksRef = useRef<HTMLElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const labelLetterRefs = useRef<(HTMLSpanElement | null)[][]>(
    PANELS.map(() => []),
  );
  const labelRowRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // The hero's own topNav is pinned to the section and scrolls away with
  // it once the pin releases — this tracks whether the section has left
  // the viewport so a separate, always-fixed nav can take over from there
  // (this route hides the site's normal Navbar, so without this there's
  // no way to navigate once you're past the hero). Set from inside the
  // main GSAP effect below (see the "bottom top" ScrollTrigger), not a
  // plain IntersectionObserver — the pin adds a lot of scroll distance
  // that only ScrollTrigger's own trigger math accounts for correctly.
  const [isPastHero, setIsPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const panels = panelRefs.current;
    const headline = headlineRef.current;
    const headlineLetters = headlineLetterRefs.current;
    const headlineLinks = headlineLinksRef.current;
    const caption = captionRef.current;
    const labelGroups = labelLetterRefs.current;
    if (
      !section ||
      !stage ||
      !headline ||
      !headlineLinks ||
      !caption ||
      !labelRowRefs.current[2] ||
      panels.some((p) => !p) ||
      headlineLetters.some((l) => !l) ||
      labelGroups.some((g) => g.length === 0 || g.some((el) => !el))
    ) {
      return;
    }
    const panelEls = panels as HTMLDivElement[];
    const headlineEls = headlineLetters as HTMLSpanElement[];
    const labels = labelGroups as HTMLSpanElement[][];

    panelEls.forEach((p) => {
      p.querySelectorAll("video").forEach((v) => {
        v.play().catch(() => {});
      });
    });

    let cancelled = false;
    let introTl: gsap.core.Timeline | null = null;
    let tl: gsap.core.Timeline | null = null;

    // Every measurement below (drop distances, the "possible." box fit
    // width) reads real layout via getBoundingClientRect — if the custom
    // fonts (Wittgenstein, Geist Mono) are still loading at mount, those
    // reads use fallback-font metrics and everything built on them (the
    // pin distance included) goes stale the moment the real font swaps in,
    // which is what was leaving the final "possible." box scrolled off.
    const setup = () => {
      if (cancelled) return;
      buildTimelines();
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(setup);
    } else {
      setup();
    }

    function buildTimelines() {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const panelDrop = section!.getBoundingClientRect().height * 0.9;
      const headlineDrop = headlineEls[0].getBoundingClientRect().height * 1.1;
      const labelDrops = labels.map(
        (group) => group[0].getBoundingClientRect().height * 1.1,
      );

      // The final frame is a fixed-feeling portrait card, NOT sized to fit
      // "possible." — the word stays full size and is deliberately WIDER
      // than the card, spilling past both edges (see the reference: the
      // word isn't contained by the frame, it bleeds over it). Keep this
      // narrower than the word (portrait, not square) — a square gets
      // close enough to the word's own width to shrink or kill that
      // overflow, which is the whole point of the effect. The card's own
      // size is driven purely by the real available room between the top
      // nav and the caption below (the other two panels are gone by this
      // point, so it isn't limited to .stage's shorter, three-panel
      // height), independent of the word.
      // Resolved to plain px numbers (not a CSS min()/calc() string):
      // GSAP tweens width/height by matching numeric tokens between the
      // start and end values, and a min()/vw expression has a different
      // token shape than the panel's calc(% - px) widths, so it can't
      // interpolate between them cleanly.
      const availableHeight =
        caption!.getBoundingClientRect().top - TOP_NAV_CLEARANCE;
      const finalHeightPx = Math.round(Math.min(availableHeight * 0.96, 720));
      const finalWidthPx = Math.round(
        Math.min(finalHeightPx / 1.5, window.innerWidth * 0.85),
      );
      const finalWidth = `${finalWidthPx}px`;
      const finalHeight = `${finalHeightPx}px`;
      // The width doesn't change for this last beat — only the height
      // flattens, from the portrait card down to a short, wide one.
      const shortHeightPx = Math.round(finalWidthPx * 0.55);
      const shortHeight = `${shortHeightPx}px`;

      // The caption sits below .stage, not below the panel itself — .stage
      // keeps its own full fixed height even once the panel inside it
      // shrinks, so without this the caption would just sit where it
      // always has, far below the now-short card. align-self:center means
      // the panel shrinks symmetrically around .stage's own center, so the
      // gap opening up above the caption is exactly half the height it
      // lost — rising the caption by that same amount closes it back up,
      // at every size the panel passes through on the way down, not just
      // the final one.
      const stageHeightPx = stage!.getBoundingClientRect().height;
      const hugY = (boxHeightPx: number) => -(stageHeightPx - boxHeightPx) / 2;

      const widths = (activeIndex: number) =>
        panelEls.map((_, i) =>
          i === activeIndex ? ACTIVE_WIDTH : COLLAPSED_WIDTH,
        );

      if (reduceMotion) {
        gsap.set(panelEls, { y: 0 });
        gsap.set(headline, { opacity: 0 });
        gsap.set(headlineLinks, { opacity: 0 });
        gsap.set(caption, { opacity: 1, y: hugY(shortHeightPx) });
        gsap.set(panelEls[0], { opacity: 0, width: "0%" });
        gsap.set(panelEls[1], { opacity: 0, width: "0%" });
        gsap.set(panelEls[2], { width: finalWidth, height: shortHeight });
        labels.forEach((group, i) =>
          gsap.set(group, {
            y: i === 2 ? 0 : -labelDrops[i],
            opacity: i === 2 ? 1 : 0,
          }),
        );
        return;
      }

      gsap.set(panelEls, { y: -panelDrop });
      gsap.set(headlineEls, {
        y: headlineDrop * 0.9,
        scale: 1.6,
        opacity: 0,
        filter: "blur(16px)",
      });
      gsap.set(headlineLinks, { opacity: 0, y: 16 });
      gsap.set(caption, { opacity: 0, y: 16 });
      labels.forEach((group, i) =>
        gsap.set(group, { y: labelDrops[i], opacity: 1 }),
      );

      const DROP = 0.6;
      const PANEL_STAGGER = 0.15;
      const HEADLINE_ENTER = 0.85;
      const HEADLINE_STAGGER = 0.045;
      const CAPTION_ENTER = 0.4;
      const HEADLINE_EXIT = 0.4;
      const WIDTH_DUR = 0.6;
      const LABEL_ENTER = 0.4;
      const LABEL_STAGGER = 0.03;
      const LABEL_EXIT = 0.3;
      const HOLD2 = 0.5;
      // Same hold "possible." gets before the box-expand cycle even starts
      // its final beat — so it isn't rushed through relative to Make/it.
      const FINAL_HOLD = HOLD2;
      const FINAL_SHRINK = 0.8;
      // One more beat after the portrait box settles: a further scroll
      // flattens it down to a short, wide card instead of leaving it tall.
      const FLATTEN_HOLD = 0.4;
      const FLATTEN_SHRINK = 0.6;

      const labelEnterDur = (i: number) =>
        LABEL_ENTER + (labels[i].length - 1) * LABEL_STAGGER;

      // Panels dropping in and the headline writing on/off happen immediately
      // on load — this intro runs in real time, not tied to scroll at all.
      const panelsEnd = DROP + (panelEls.length - 1) * PANEL_STAGGER;
      // Starts while the last panel is still settling in, not after —
      // reads as one continuous entrance instead of two sequential beats.
      const headlineStart = panelsEnd - 0.3;
      const headlineEnterDur =
        HEADLINE_ENTER + (headlineEls.length - 1) * HEADLINE_STAGGER;
      const headlineEnd = headlineStart + headlineEnterDur;
      const captionStart = headlineEnd;
      // The links only need to wait for the headline to read as formed,
      // not for the very last letter's own tween to fully settle — riding
      // in on the tail of that last letter instead of after it.
      const linksStart = headlineStart + headlineEnterDur * 0.7;

      introTl = gsap.timeline();
      introTl
        .to(
          panelEls,
          { y: 0, duration: DROP, ease: "power3.out", stagger: PANEL_STAGGER },
          0,
        )
        // Big, weighted entrance — scales and un-blurs into place with a
        // strong per-letter stagger, distinct from the panel labels' plain
        // mask-wipe reveal.
        .to(
          headlineEls,
          {
            y: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: HEADLINE_ENTER,
            ease: "expo.out",
            stagger: HEADLINE_STAGGER,
          },
          headlineStart,
        )
        .to(
          caption,
          { opacity: 1, y: 0, duration: CAPTION_ENTER, ease: "power3.out" },
          captionStart,
        )
        .to(
          headlineLinks,
          { opacity: 1, y: 0, duration: CAPTION_ENTER, ease: "power3.out" },
          linksStart,
        );
      // Headline (and the links row under it) stay put after the intro —
      // they only fade once the user actually starts scrolling (see the
      // scroll-scrubbed timeline below), not on a fixed delay.

      // Headline visibility is tied to scroll DIRECTION, but only near the
      // very start of the sequence — once a word (Make/it/possible.) is
      // active, letting the headline pop back over it just makes both
      // unreadable. HEADLINE_REENTRY_WINDOW is how far into the
      // scroll-scrubbed timeline (in seconds) it's still allowed to return.
      const HEADLINE_REENTRY_WINDOW = 0.15;
      const headlineState = { visible: true };
      const setHeadlineVisible = (visible: boolean) => {
        if (headlineState.visible === visible) return;
        headlineState.visible = visible;
        gsap.to([headline, headlineLinks], {
          opacity: visible ? 1 : 0,
          duration: HEADLINE_EXIT,
          ease: "power2.out",
          overwrite: true,
        });
      };

      // Everything from here — the box-expand cycle — stays scroll-scrubbed,
      // starting fresh at scroll position 0 once the intro has settled.
      let lastScroll: number | null = null;
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // Less scroll distance per second of timeline = the same
          // sequence resolves in fewer scroll ticks, i.e. feels faster.
          end: () => "+=" + window.innerHeight * 4.8,
          // Lower than it looks like it needs to be on purpose: any scrub
          // smoothing leaves a window, right after the user stops
          // scrolling, where the panel width is still catching up to its
          // target — pause and screenshot in that window (as opposed to a
          // fast fling) and a word can be caught mid-widen, clipped by its
          // own still-narrow panel. 0.6 made that window uncomfortably
          // long; 0.25 keeps the smoothing without leaving it noticeable.
          scrub: 0.25,
          // A fast/flicked scroll (exactly what happens flinging back up
          // from "possible.") can leave the eased scrub tween lagging well
          // behind the real scroll position for a second or more, which
          // reads as panels being "stuck" mid-transition. fastScrollEnd
          // detects that and snaps the scrub straight to the target instead
          // of easing through it.
          fastScrollEnd: true,
          pin: true,
          anticipatePin: 1,
          // A separate ScrollTrigger on this same element (e.g. a plain
          // "bottom top" trigger) gets its start/end position wrong once
          // this one is already pinning it — its own onLeave/onEnterBack
          // are the reliable way to know once the user has scrolled past
          // the whole pinned sequence (pin included), regardless of how
          // little page content follows it.
          onLeave: () => setIsPastHero(true),
          onEnterBack: () => setIsPastHero(false),
          onUpdate: (self) => {
            // ScrollTrigger fires onUpdate synthetically during its own
            // setup/pin refresh, before any real scrolling — GSAP's own
            // self.direction isn't reliable for telling those apart, so
            // track raw scroll position ourselves and only react when it
            // actually moves.
            const current = self.scroll();
            if (lastScroll === null) {
              lastScroll = current;
              return;
            }
            if (current === lastScroll) return;
            const goingUp = current < lastScroll;
            // self.progress reflects the raw scroll position synchronously;
            // scrollTl.time() is the eased/lagging scrub value and can stay
            // stale here once scrolling stops, since nothing re-fires
            // onUpdate to re-check it as the scrub catches up afterward.
            const rawTime = self.progress * scrollTl.duration();
            setHeadlineVisible(goingUp && rawTime < HEADLINE_REENTRY_WINDOW);
            lastScroll = current;
          },
        },
      });
      tl = scrollTl;

      // Cycle the active panel: box N widens with its word while the other
      // two collapse to thin strips — "possible." is left active at the end,
      // matching the earlier decision to let the last word stay put.
      let cursor = 0;
      PANELS.forEach((_, i) => {
        const boxStart = cursor;
        scrollTl.to(
          panelEls,
          {
            width: (idx) => widths(i)[idx],
            duration: WIDTH_DUR,
            ease: "power3.inOut",
          },
          boxStart,
        );

        if (i > 0) {
          scrollTl.to(
            labels[i - 1],
            {
              y: -labelDrops[i - 1],
              opacity: 0,
              duration: LABEL_EXIT,
              ease: "power2.in",
            },
            boxStart,
          );
        }

        // The word is full-size regardless of how wide the panel currently
        // is, so starting the reveal too early — while the panel is still
        // mostly collapsed — let the word overflow its own (still narrow)
        // panel and get clipped by overflow:hidden. Waiting until the width
        // tween is most of the way there (WIDTH_DUR 0.6s, power3.inOut eases
        // through most of its travel by ~0.4s in) keeps the panel wide
        // enough to hold the word before it's visible.
        const labelStart = boxStart + 0.4;
        scrollTl.to(
          labels[i],
          {
            y: 0,
            duration: LABEL_ENTER,
            ease: "power3.out",
            stagger: LABEL_STAGGER,
          },
          labelStart,
        );

        const labelEnd = labelStart + labelEnterDur(i);
        cursor = i === PANELS.length - 1 ? labelEnd : labelEnd + HOLD2;
      });

      // Final beat: the other two panels fade out while "possible."
      // reframes itself — the box resizes to fit the word (measured above),
      // the word itself never changes size. Opacity instead of a y-offset:
      // a position tween has to travel the exact panelDrop distance back to
      // reappear, which is what was glitching on scroll-up; fading is a
      // single 0→1 round trip either direction. The caption rises in step
      // with it — the box is still shrinking here too (full stage height
      // down to the portrait height), not just in the flatten beat below.
      const finalShrinkStart = cursor + FINAL_HOLD;
      const lastIndex = PANELS.length - 1;
      // The caption's own hugY tween used to run as a separate parallel
      // .to() here, sharing finalShrinkStart/FINAL_SHRINK/easing with the
      // panel's width/height tween. In theory that keeps them in lockstep;
      // in practice the panel's width/height are layout-triggering
      // properties (the browser has to reflow before it can paint them),
      // while the caption's y is a pure transform (paints immediately) —
      // so on scroll, the caption visibly reached its new position a beat
      // before the panel's own resize caught up, reading as a jump instead
      // of a synced move. Driving the caption from the panel's actual
      // measured height every tick (onUpdate, after GSAP has applied that
      // tick's width/height) ties it directly to the real reflowed state
      // instead of a same-schedule-but-different-render-path guess.
      const followPanelHeight = () => {
        gsap.set(caption, {
          y: hugY(panelEls[lastIndex].getBoundingClientRect().height),
        });
      };
      scrollTl
        .to(
          panelEls.filter((_, i) => i !== lastIndex),
          {
            opacity: 0,
            width: "0%",
            duration: FINAL_SHRINK,
            ease: "power2.in",
          },
          finalShrinkStart,
        )
        .to(
          panelEls[lastIndex],
          {
            width: finalWidth,
            height: finalHeight,
            duration: FINAL_SHRINK,
            ease: "power3.inOut",
            onUpdate: followPanelHeight,
          },
          finalShrinkStart,
        );

      // One more beat: after the portrait card has had a moment to settle,
      // continued scrolling flattens it down to a short, wide card — width
      // stays put, only height moves. The caption keeps hugging it down to
      // its new, shorter height via the same onUpdate as above, not a
      // separate parallel tween.
      const flattenStart = finalShrinkStart + FINAL_SHRINK + FLATTEN_HOLD;
      scrollTl.to(
        panelEls[lastIndex],
        {
          height: shortHeight,
          duration: FLATTEN_SHRINK,
          ease: "power3.inOut",
          onUpdate: followPanelHeight,
        },
        flattenStart,
      );
    }

    return () => {
      cancelled = true;
      introTl?.kill();
      tl?.scrollTrigger?.kill();
      tl?.kill();
    };
  }, []);

  return (
    <>
      <div
        className={`${styles.stickyNav} ${isPastHero ? styles.stickyNavVisible : ""}`}
      >
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={24}
          height={22}
          className={styles.stickyLogo}
        />
        <nav className={styles.links} aria-label="primary">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
              <Image
                src="/images/hero-reveal/arrow-up-right.svg"
                alt=""
                width={12}
                height={12}
                className={styles.linkIcon}
              />
            </Link>
          ))}
        </nav>
      </div>

      <section className={styles.section} ref={sectionRef}>
        <div className={styles.topNav}>
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={28}
            height={26}
            className={styles.topLogo}
            priority
          />
        </div>

        {/* Fixed-positioned (see MenuToggleButton itself), so this only
            needs to exist in the DOM while the hero is the relevant nav
            context — once scrolled past, stickyNav's own inline links take
            over navigation instead. */}
        {!isPastHero ? (
          <MenuToggleButton
            open={menuOpen}
            onToggle={() => setMenuOpen((o) => !o)}
          />
        ) : null}

        <FullScreenNav
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          links={FOOTER_LINKS}
        />

        <div className={styles.stage} ref={stageRef}>
          <div className={styles.panels}>
            {PANELS.map((panel, i) => (
              <div
                key={panel.word}
                className={styles.panel}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                <div className={styles.panelMedia}>
                  <video
                    className={styles.media}
                    src={panel.src}
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                  <div className={styles.scrim} />
                </div>
                <div className={styles.panelLabel}>
                  <span
                    className={styles[panel.variant]}
                    ref={(el) => {
                      labelRowRefs.current[i] = el;
                    }}
                  >
                    {panel.word.split("").map((ch, li) => (
                      <span key={li} className={styles.letterMask}>
                        <span
                          className={styles.letter}
                          ref={(el) => {
                            labelLetterRefs.current[i][li] = el;
                          }}
                        >
                          {ch}
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.headlineGroup}>
            <div className={styles.headline} ref={headlineRef}>
              {HEADLINE.split("").map((ch, i) => (
                <span
                  key={i}
                  className={styles.headlineLetter}
                  ref={(el) => {
                    headlineLetterRefs.current[i] = el;
                  }}
                >
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </div>

            <nav
              className={styles.links}
              aria-label="secondary"
              ref={headlineLinksRef}
            >
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={styles.link}>
                  {link.label}
                  <Image
                    src="/images/hero-reveal/arrow-up-right.svg"
                    alt=""
                    width={12}
                    height={12}
                    className={styles.linkIcon}
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className={styles.nameBlock} ref={captionRef}>
          <p className={styles.role}>Creative Director</p>
        </div>
      </section>
    </>
  );
}
