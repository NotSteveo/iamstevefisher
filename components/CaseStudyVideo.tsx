import { asset, posterFor } from "@/lib/assets";
import type { VideoRef } from "@/lib/content";
import MotionVideo from "./MotionVideo";
import styles from "./CaseStudyVideo.module.css";

export default function CaseStudyVideo({
  video,
  rounded = true,
  className,
}: {
  video: VideoRef;
  rounded?: boolean;
  className?: string;
}) {
  // Stand-in until the real Vimeo URL exists: swap the entry's type to
  // "vimeo iframe embed" and set src to the player URL.
  if (video.type === "placeholder") {
    return (
      <div className={`${styles.embedWrap} ${styles.placeholder} ${rounded ? styles.rounded : ""} ${className ?? ""}`}>
        <span>{video.title ?? "Video"}</span>
        <span className={styles.placeholderNote}>Video coming soon</span>
      </div>
    );
  }

  if (video.type.includes("iframe embed") && video.src) {
    return (
      <div className={`${styles.embedWrap} ${rounded ? styles.rounded : ""} ${className ?? ""}`}>
        <iframe
          className={styles.embed}
          src={video.src}
          title={video.title ?? "Embedded video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (!video.mp4) return null;

  return (
    <MotionVideo
      className={`${styles.video} ${rounded ? styles.rounded : ""} ${className ?? ""}`}
      src={asset(video.mp4)}
      poster={video.poster ? asset(video.poster) : posterFor(asset(video.mp4))}
      autoPlay
      loop
      muted
      playsInline
      controls={false}
      aria-label={video.alt}
      aria-hidden={video.alt ? undefined : true}
    />
  );
}
