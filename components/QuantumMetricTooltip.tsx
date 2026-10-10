"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./QuantumMetricTooltip.module.css";

const FILL_DURATION_MS = 1000;
const GAP = 14;

function Reel() {
  return (
    <>
      <div className={styles.media}>
        <iframe
          className={styles.mediaFrame}
          src="https://player.vimeo.com/video/1231341054?badge=0&autopause=0&player_id=0&app_id=58479"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Steve Fisher - Quantum Metric Show Reel"
        />
      </div>
      <div className={styles.caption}>Quantum Metric Showreel</div>
    </>
  );
}

// "modal" is for anywhere the button sits too close to the viewport's top
// edge (the Work page header) for the anchored tooltip's translateY(-100%)
// positioning to have room to open upward — a centered, click-only modal
// sidesteps that instead of fighting with edge-of-viewport math. "tooltip"
// (the default, used on the homepage bio) keeps the original hover-to-fill,
// anchored-above-the-button behavior, which has plenty of clearance there.
export default function QuantumMetricTooltip({
  variant = "tooltip",
}: {
  variant?: "tooltip" | "modal";
}) {
  if (variant === "modal") return <ModalTrigger />;
  return <TooltipTrigger />;
}

function ModalTrigger() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <span className={styles.root}>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className={styles.buttonLabel}>
          Quantum Metric
          <span className={styles.playIcon} aria-hidden="true" />
        </span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              className={styles.modalDialog}
              role="dialog"
              aria-modal="true"
              aria-label="Quantum Metric showreel"
            >
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
              >
                Close
                <span aria-hidden="true">×</span>
              </button>
              <Reel />
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}

function TooltipTrigger() {
  const [hoverButton, setHoverButton] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState(false);
  const [filling, setFilling] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Open while hovering the button, hovering the tooltip itself (so
  // moving the mouse up into it doesn't close it), or once pinned.
  const open = hoverButton || hoverTooltip || pinned;

  useEffect(() => setMounted(true), []);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  // The 1s hold is specifically about the button, not the tooltip it
  // opens — moving off the button resets it even if the tooltip (which
  // has its own hover-keeps-open handling below) is still up.
  function handleButtonEnter() {
    setHoverButton(true);
    if (pinned) return; // already earned, nothing left to fill
    setFilling(true);
    clearTimer();
    timerRef.current = setTimeout(() => setPinned(true), FILL_DURATION_MS);
  }

  function handleButtonLeave() {
    setHoverButton(false);
    if (pinned) return; // stays open + filled once the hold is earned
    clearTimer();
    setFilling(false);
  }

  function handleClose() {
    clearTimer();
    setPinned(false);
    setHoverButton(false);
    setHoverTooltip(false);
    setFilling(false);
  }

  // The tooltip renders into <body> (see the portal below) so it can
  // escape .current's overflow:hidden reveal mask — which means it can't
  // be positioned with ordinary CSS relative to the button anymore, only
  // computed from its real screen position.
  useLayoutEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.top - GAP, left: rect.left });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Once pinned, the tooltip only comes down again via Close or a click
  // outside it — hover alone no longer controls it. Checked against both
  // the button and the portaled tooltip since they're no longer the same
  // DOM subtree.
  useEffect(() => {
    if (!pinned) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      handleClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned]);

  useEffect(() => clearTimer, []);

  return (
    <span className={styles.root} ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.button}
        aria-expanded={open}
        onMouseEnter={handleButtonEnter}
        onMouseLeave={handleButtonLeave}
        onClick={() => {
          // A click pins it open immediately — the 1s hold is a shortcut
          // for hover, not the only way in.
          if (pinned) {
            handleClose();
          } else {
            clearTimer();
            setPinned(true);
          }
        }}
      >
        <span
          className={`${styles.fill} ${filling || pinned ? styles.fillGrown : ""}`}
        />
        <span className={styles.buttonLabel}>
          Quantum Metric
          <span className={styles.playIcon} aria-hidden="true" />
        </span>
      </button>

      {open &&
        mounted &&
        position &&
        createPortal(
          <div
            ref={tooltipRef}
            className={styles.tooltip}
            style={{ top: position.top, left: position.left }}
            role="dialog"
            aria-label="Quantum Metric showreel"
            onMouseEnter={() => setHoverTooltip(true)}
            onMouseLeave={() => setHoverTooltip(false)}
          >
            <button type="button" className={styles.close} onClick={handleClose}>
              Close
              <span aria-hidden="true">×</span>
            </button>
            <Reel />
          </div>,
          document.body,
        )}
    </span>
  );
}
