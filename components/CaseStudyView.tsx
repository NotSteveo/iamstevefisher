import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/assets";
import type { CaseStudy, ContentBlock } from "@/lib/caseStudy";
import WorkCard from "./WorkCard";
import CaseStudyVideo from "./CaseStudyVideo";
import styles from "./CaseStudyView.module.css";

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case "subheading":
      return <h3 className={styles.subheading}>{block.text}</h3>;
    case "paragraph":
      return <p className={styles.paragraph}>{block.text}</p>;
    case "creditLine":
      return <p className={styles.creditLine}>{block.text}</p>;
    case "caption":
      return <p className={styles.caption}>{block.text}</p>;
    case "pullQuote":
      return <blockquote className={styles.pullQuote}>{block.text}</blockquote>;
    case "statCallout":
      return <p className={styles.statCallout}>{block.text}</p>;
    case "externalLink":
      return (
        <Link
          href={block.href}
          className={styles.externalLink}
          target={block.href.startsWith("http") ? "_blank" : undefined}
          rel={block.href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {block.text} →
        </Link>
      );
    default:
      return null;
  }
}

export default function CaseStudyView({ study }: { study: CaseStudy }) {
  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.headline}>{study.headline}</h1>
          <p className={styles.body}>{study.body}</p>

          {study.credits.length > 0 ? (
            <div className={styles.credits}>
              {study.credits.map((c) => (
                <p key={c} className={styles.creditLine}>
                  {c}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {study.heroVideo ? (
          <div className={styles.heroMedia}>
            <CaseStudyVideo video={study.heroVideo} rounded={false} />
          </div>
        ) : study.heroImage ? (
          <div className={styles.heroMedia}>
            <div className={styles.heroImageWrap}>
              <Image
                src={asset(study.heroImage.url)}
                alt={study.heroImage.context ?? study.headline}
                fill
                sizes="100vw"
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        ) : null}
      </section>

      {study.sections.map((section, i) => (
        <section key={i} className={styles.section}>
          <div className="wrap">
            {section.heading ? <h2 className={styles.heading}>{section.heading}</h2> : null}

            <div className={styles.textColumn}>
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </div>

            {section.images.length > 0 || section.videos.length > 0 ? (
              <div className={styles.mediaGrid}>
                {section.videos.map((video, j) => (
                  <div key={`v-${j}`} className={styles.mediaItem}>
                    <CaseStudyVideo video={video} />
                  </div>
                ))}
                {section.images.map((image, j) => (
                  <div key={`i-${j}`} className={styles.mediaItem}>
                    <div className={styles.imageWrap}>
                      <Image
                        src={asset(image.url)}
                        alt={image.context ?? ""}
                        fill
                        sizes="(max-width: 767px) 100vw, 50vw"
                        className={styles.sectionImage}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}

      {study.moreWork.length > 0 ? (
        <section className={styles.moreWork}>
          <div className="wrap">
            <h2 className={styles.heading}>More Work</h2>
            <div className={styles.moreWorkGrid}>
              {study.moreWork.map((project) => (
                <WorkCard key={project.href + project.title} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
