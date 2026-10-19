"use client";

import { useEffect, useRef } from "react";
import type { VideoHTMLAttributes } from "react";

// A <video> that honours prefers-reduced-motion: autoplaying loops are held
// on their first frame (the poster, when there is one) for people who've asked
// their system to cut motion.
export default function MotionVideo(props: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (query.matches) video.pause();
      else if (props.autoPlay) void video.play().catch(() => {});
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [props.autoPlay]);

  return <video ref={ref} {...props} />;
}
