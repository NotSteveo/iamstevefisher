import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/assets";
import type { WorkCard as WorkCardType } from "@/lib/content";
import styles from "./WorkCard.module.css";

export default function WorkCard({
  project,
  roleLine,
}: {
  project: WorkCardType;
  roleLine?: string;
}) {
  return (
    <Link href={project.href} className={styles.card}>
      {project.coverImage ? (
        <div className={styles.imageWrap}>
          <Image
            src={asset(project.coverImage)}
            alt={project.title}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"
            className={styles.image}
          />
        </div>
      ) : (
        <div className={styles.imagePlaceholder} aria-hidden />
      )}

      <div className={styles.textWrap}>
        <div className={styles.headline}>{project.title.replace(/\|/g, " | ")}</div>
        {roleLine ? <p className={styles.roleLine}>{roleLine}</p> : null}
      </div>

      <div className={styles.tagWrap}>
        {project.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
