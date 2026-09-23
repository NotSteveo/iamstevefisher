import { asset } from "@/lib/assets";
import type { VideoRef } from "@/lib/content";
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
    <video
      className={`${styles.video} ${rounded ? styles.rounded : ""} ${className ?? ""}`}
      src={asset(video.mp4)}
      poster={video.poster ? asset(video.poster) : undefined}
      autoPlay
      loop
      muted
      playsInline
      controls={false}
    />
  );
}
