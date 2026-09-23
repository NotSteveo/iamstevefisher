import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/assets";
import type { CaseStudy, ContentBlock, MediaGroup } from "@/lib/caseStudy";
import WorkCard from "./WorkCard";
import CaseStudyVideo from "./CaseStudyVideo";
import RevealText from "./RevealText";
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

// Each media group has its own real column count (reverse-engineered from
// the live Webflow site — see MediaLayout in lib/content.ts), so the grid
// is built with a --cols custom property instead of a fixed CSS class.
// group.items preserves the original image/video interleave order (e.g. a
// promo video beside a social post image), not images-then-videos. Some
// groups also carry `widths` (relative fr units, one per item) for
// Webflow's own bespoke column ratios — e.g. five equal swatches beside
// one much wider logo card — which repeat(columns,1fr) alone can't
// reproduce; --col-widths overrides the even split when present (see
// .mediaGrid in CaseStudyView.module.css), while --cols still drives the
// mobile breakpoints so those grids still collapse sensibly.
function MediaGrid({ group }: { group: MediaGroup }) {
  if (group.items.length === 0) return null;

  const style: CSSProperties = { "--cols": group.columns } as CSSProperties;
  const widths = group.widths;
  if (widths) {
    (style as Record<string, string>)["--col-widths"] = widths.map((w) => `${w}fr`).join(" ");
  }
  // `.imageWrap`'s aspect-ratio sizes each item's height from its OWN
  // column width — fine when every item already shares the anchor's real
  // ratio, but anything else in the row (a wider bespoke column, or just
  // an image with a different native aspect ratio, e.g. one 4:5 photo
  // beside three 16:9 screenshots) would otherwise compute its own height
  // independently, leaving a black gap under whichever item is shorter.
  // group.anchorIndex (default 0) is reverse-engineered per block from the
  // real live-Webflow render, not assumed. A group can wrap to more than
  // one row (e.g. 4 items in a 2-column grid), and every row needs its own
  // height reference — so every item at the SAME column position as
  // anchorIndex (i.e. i % columns === anchorIndex % columns), not just
  // that one absolute item, keeps aspect-ratio; everything else drops its
  // own aspect-ratio and stretches to match via Grid's default
  // align-items: stretch (see .imageWrapStretch in CaseStudyView.module.css).
  const anchorIndex = group.anchorIndex ?? 0;
  const anchorColumn = anchorIndex % group.columns;
  if (group.anchorAspect) {
    (style as Record<string, string>)["--anchor-aspect"] = `${group.anchorAspect[0]} / ${group.anchorAspect[1]}`;
  }

  return (
    <div className={styles.mediaGrid} style={style}>
      {group.items.map((item, i) => {
        const wrapClassName =
          group.anchorAspect && i % group.columns !== anchorColumn
            ? `${styles.imageWrap} ${styles.imageWrapStretch}`
            : styles.imageWrap;

        return item.kind === "video" ? (
          <RevealText key={i} className={styles.mediaItem}>
            <div className={wrapClassName}>
              <CaseStudyVideo video={item.ref} className={styles.gridVideo} />
            </div>
          </RevealText>
        ) : (
          <RevealText key={i} className={styles.mediaItem}>
            <div className={wrapClassName}>
              <Image
                src={asset(item.ref.url)}
                alt={item.ref.context ?? ""}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className={styles.sectionImage}
              />
            </div>
          </RevealText>
        );
      })}
    </div>
  );
}

// Groups consecutive "block" items into one run so they share a single
// .textColumn wrapper (and its gap/max-width) exactly as before — only a
// "media" item breaks a run, same as it breaks the page's visual flow.
type Run = { kind: "blocks"; blocks: ContentBlock[] } | { kind: "media"; group: MediaGroup };
function toRuns(items: CaseStudy["sections"][number]["items"]): Run[] {
  const runs: Run[] = [];
  for (const item of items) {
    if (item.kind === "media") {
      runs.push({ kind: "media", group: item.group });
      continue;
    }
    const last = runs[runs.length - 1];
    if (last?.kind === "blocks") last.blocks.push(item.block);
    else runs.push({ kind: "blocks", blocks: [item.block] });
  }
  return runs;
}

export default function CaseStudyView({ study }: { study: CaseStudy }) {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <h1 className={styles.headline}>{study.headline}</h1>
              <p className={styles.body}>{study.body}</p>
              {study.heroExtraParagraphs.map((p) => (
                <p key={p} className={styles.body}>
                  {p}
                </p>
              ))}

              {study.heroLink ? (
                <Link
                  href={study.heroLink.href}
                  className={styles.heroLink}
                  target={study.heroLink.href.startsWith("http") ? "_blank" : undefined}
                  rel={study.heroLink.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {study.heroLink.text} →
                </Link>
              ) : null}
            </div>

            {study.credits.length > 0 ? (
              <div className={styles.credits}>
                {study.credits.map((c) => {
                  const [label, name] = c.split(/:\s*/, 2);
                  return (
                    <p key={c} className={styles.creditEntry}>
                      {label}
                      <br />
                      <strong className={styles.creditName}>{name}</strong>
                    </p>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {study.heroVideo ? (
          <div className={`${styles.wrap} ${styles.heroVideoWrap}`}>
            <div className={styles.deviceFrame}>
              <CaseStudyVideo
                video={study.heroVideo}
                rounded={false}
                className={styles.deviceFrameVideo}
              />
            </div>
          </div>
        ) : study.heroImage ? (
          <div className={`${styles.wrap} ${styles.heroVideoWrap}`}>
            <div className={styles.heroImageWrap}>
              <Image
                src={asset(study.heroImage.url)}
                alt={study.heroImage.context ?? study.headline}
                fill
                sizes="(max-width: 1500px) 100vw, 1500px"
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        ) : null}
      </section>

      {study.sections.map((section, i) => (
        <section key={i} className={styles.section}>
          <div className={styles.wrap}>
            {section.heading ? <h2 className={styles.heading}>{section.heading}</h2> : null}

            {toRuns(section.items).map((run, j) =>
              run.kind === "blocks" ? (
                <div key={j} className={styles.textColumn}>
                  {run.blocks.map((block, k) => (
                    <Block key={k} block={block} />
                  ))}
                </div>
              ) : (
                <MediaGrid key={j} group={run.group} />
              ),
            )}
          </div>
        </section>
      ))}

      {study.moreWork.length > 0 ? (
        <section className={styles.moreWork}>
          <div className={styles.wrap}>
            <p className={styles.moreWorkLabel}>More work</p>
            <div className={styles.moreWorkGrid}>
              {study.moreWork.map((project) => (
                <WorkCard key={project.href + project.title} project={project} dark />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
