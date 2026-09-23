import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/assets";
import type { WorkCard } from "@/lib/content";
import styles from "./AiMusingsCard.module.css";

export default function AiMusingsCard({ post }: { post: WorkCard }) {
  return (
    <Link href={post.href} className={styles.card}>
      <div className={styles.art} aria-hidden>
        {post.coverVideoMp4 ? (
          <video
            className={styles.thumb}
            src={asset(post.coverVideoMp4)}
            poster={post.coverImage ? asset(post.coverImage) : undefined}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          >
            {post.coverVideoWebm ? <source src={asset(post.coverVideoWebm)} type="video/webm" /> : null}
          </video>
        ) : post.coverImage ? (
          <Image
            src={asset(post.coverImage)}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className={styles.thumb}
          />
        ) : (
          <>
            <span className={styles.sparkleText}>Just add sparkles.</span>
            <span className={styles.sparkleSubtext}>Click anywhere to be relevant.</span>
          </>
        )}
      </div>

      <div className={styles.title}>{post.title}</div>

      <div className={styles.tagWrap}>
        {post.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
