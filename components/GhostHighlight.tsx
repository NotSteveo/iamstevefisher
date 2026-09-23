"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./GhostHighlight.module.css";

const LEAVE_DURATION_MS = 400;

// A little ghost that peeks out from behind "13+"/"years" on hover — pure
// whimsy, no tooltip content, just a small animated SVG.
function Ghost() {
  return (
    <svg
      viewBox="0 0 40 44"
      className={styles.ghostSvg}
      aria-hidden="true"
    >
      <path
        d="M20 2C10 2 4 10 4 20V38L9 33L14 38L20 33L26 38L31 33L36 38V20C36 10 30 2 20 2Z"
        fill="#f5f5f5"
      />
      <circle cx="14" cy="20" r="2.4" fill="#111" />
      <circle cx="26" cy="20" r="2.4" fill="#111" />
    </svg>
  );
}

export default function GhostHighlight({ text }: { text: string }) {
  // Mounted (visible at all) vs. leaving (still mounted, but playing the
  // fly-away-and-fade animation) are separate — unmounting the instant
  // the hover ends gives the exit animation no time to actually play.
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  useLayoutEffect(() => {
    if (!visible) return;
    const rect = wordRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.top, left: rect.left + rect.width / 2 });
  }, [visible]);

  function handleEnter() {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setLeaving(false);
    setVisible(true);
  }

  function handleLeave() {
    setLeaving(true);
    leaveTimer.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
    }, LEAVE_DURATION_MS);
  }

  return (
    <span
      className={styles.word}
      ref={wordRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {text}
      {visible &&
        mounted &&
        position &&
        createPortal(
          <span
            className={`${styles.ghost} ${leaving ? styles.leaving : ""}`}
            style={{ top: position.top, left: position.left }}
            aria-hidden="true"
          >
            <Ghost />
          </span>,
          document.body,
        )}
    </span>
  );
}
