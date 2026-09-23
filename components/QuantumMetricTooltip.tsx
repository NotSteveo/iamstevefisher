"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./QuantumMetricTooltip.module.css";

const FILL_DURATION_MS = 1000;
const GAP = 14;

export default function QuantumMetricTooltip() {
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
            <div className={styles.media} />
            <div className={styles.caption}>Quantum Metric Showreel</div>
          </div>,
          document.body,
        )}
    </span>
  );
}
