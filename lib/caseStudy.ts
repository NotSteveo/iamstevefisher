import { workIndex } from "./content";
import type {
  ImageRef,
  MediaLayoutBlock,
  Section,
  VideoRef,
  WorkCard,
  WorkPageContent,
} from "./content";

const coverImageByHref = new Map(workIndex.projects.map((p) => [p.href, p.coverImage]));

function withCoverImage(card: WorkCard): WorkCard {
  return card.coverImage ? card : { ...card, coverImage: coverImageByHref.get(card.href) };
}

export type ContentBlock =
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "creditLine"; text: string }
  | { kind: "caption"; text: string }
  | { kind: "pullQuote"; text: string }
  | { kind: "statCallout"; text: string }
  | { kind: "externalLink"; text: string; href: string };

export type MediaItem = { kind: "image"; ref: ImageRef } | { kind: "video"; ref: VideoRef };
export type MediaGroup = {
  columns: number;
  widths?: number[];
  anchorAspect?: [number, number];
  anchorIndex?: number;
  items: MediaItem[];
};

export type SectionItem =
  | { kind: "block"; block: ContentBlock }
  | { kind: "media"; group: MediaGroup };

export type CaseStudySection = {
  heading?: string;
  items: SectionItem[];
};

export type CaseStudy = {
  headline: string;
  body: string;
  // Extra "body paragraph" sections between the hero body and the first
  // heading (or the external link/credits, whichever comes first) — e.g.
  // adobe-workfront-web-design's "After Workfront was acquired..." line.
  // Still hero content, just a second paragraph, not the flowing body.
  heroExtraParagraphs: string[];
  credits: string[];
  heroLink?: { text: string; href: string };
  heroImage?: ImageRef;
  heroVideo?: VideoRef;
  sections: CaseStudySection[];
  moreWork: WorkCard[];
};

function contextKey(context: string | undefined): string {
  if (!context) return "";
  return context.split(" - ")[0].split(",")[0].trim().toLowerCase();
}

function matches(key: string, heading: string): boolean {
  if (!key || !heading) return false;
  const h = heading.toLowerCase();
  return key.includes(h) || h.includes(key);
}

export function buildCaseStudy(page: WorkPageContent): CaseStudy {
  const sections = page.sections;

  const headline =
    (sections.find((s) => s.type === "hero headline")?.text as string) ?? page.title;
  const body = (sections.find((s) => s.type === "hero body")?.text as string) ?? "";
  const credits = (sections.find((s) => s.type === "credits")?.text as string[]) ?? [];
  const moreWork = (
    (sections.find((s): s is Section & { projects: WorkCard[] } => s.type === "more work")
      ?.projects as WorkCard[]) ?? []
  ).map(withCoverImage);

  // findMedia resolves a mediaLayout URL (an images[].url, or a videos[].mp4
  // or videos[].src) back to its full ImageRef/VideoRef — mediaLayout only
  // stores the URL so it doesn't duplicate context/title/poster metadata
  // that already lives in page.images/page.videos.
  function findMedia(url: string): { image?: ImageRef; video?: VideoRef } {
    const image = page.images.find((i) => i.url === url);
    if (image) return { image };
    const video = page.videos.find((v) => (v.mp4 ?? v.src) === url);
    return { video };
  }

  const layout = page.mediaLayout;
  let heroImage: ImageRef | undefined;
  let heroVideo: VideoRef | undefined;

  if (layout) {
    if (layout.hero) {
      const { image, video } = findMedia(layout.hero);
      heroImage = image;
      heroVideo = video;
    }
  } else {
    // Fallback for any work page without a reverse-engineered mediaLayout
    // (see MediaLayout in ./content) — best-effort guess at hero media and
    // otherwise dumps a section's images/videos into one pooled grid.
    const images = [...page.images];
    const videos = [...page.videos];
    const heroVideoIdx = videos.findIndex((v) => /hero|intro/i.test(v.context ?? ""));
    heroVideo =
      heroVideoIdx >= 0 ? videos[heroVideoIdx] : videos.length === 1 ? videos[0] : undefined;
    if (!heroVideo) {
      const heroImageIdx = images.findIndex((i) => /hero|cover/i.test(i.context ?? ""));
      heroImage = images[heroImageIdx >= 0 ? heroImageIdx : 0];
    }
  }

  const caseSections: CaseStudySection[] = [];
  let current: CaseStudySection | null = null;

  function ensureCurrent(): CaseStudySection {
    if (!current) {
      current = { items: [] };
      caseSections.push(current);
    }
    return current;
  }

  const layoutBlocks: MediaLayoutBlock[] = layout?.blocks ?? [];
  let layoutIdx = 0;

  function pushMediaBlock(target: CaseStudySection, lb: MediaLayoutBlock) {
    const items: MediaItem[] = [];
    for (const url of lb.items) {
      const { image, video } = findMedia(url);
      if (image) items.push({ kind: "image", ref: image });
      else if (video) items.push({ kind: "video", ref: video });
    }
    if (items.length === 0) return;
    target.items.push({
      kind: "media",
      group: {
        columns: lb.columns,
        widths: lb.widths,
        anchorAspect: lb.anchorAspect,
        anchorIndex: lb.anchorIndex,
        items,
      },
    });
  }

  // Drains every consecutive mediaLayout block anchored to `headingText`,
  // in order — called right before the heading/sub-heading scope it
  // belongs to closes (the next heading starts, or the section ends), so
  // each group renders after that heading's own text, matching the live
  // Webflow layout instead of pooling everything at the end of the page.
  function flushPendingFor(headingText: string | null) {
    if (layoutBlocks.length === 0) return;
    const target = ensureCurrent();
    while (layoutIdx < layoutBlocks.length && layoutBlocks[layoutIdx].after === headingText) {
      pushMediaBlock(target, layoutBlocks[layoutIdx]);
      layoutIdx++;
    }
  }

  let openHeading: string | null = null;
  // Any "external link" that shows up before the first heading — e.g.
  // peak-benchmark-report's "Find the live version here." — is still part
  // of the hero, not flowing body content, so it's hoisted out the same
  // way credits are rather than rendered inline via Block/ContentBlock.
  let heroLink: { text: string; href: string } | undefined;
  const heroExtraParagraphs: string[] = [];

  for (const s of sections) {
    if (
      s.type === "hero headline" ||
      s.type === "hero body" ||
      s.type === "credits" ||
      s.type === "more work"
    ) {
      continue;
    }

    if (s.type === "external link" && openHeading === null && !heroLink) {
      heroLink = { text: s.text as string, href: s.href ?? "#" };
      continue;
    }

    if (s.type === "body paragraph" && openHeading === null && !current) {
      heroExtraParagraphs.push(s.text as string);
      continue;
    }

    if (s.type === "section heading") {
      flushPendingFor(openHeading);
      const text = s.text as string;
      current = { heading: text, items: [] };
      caseSections.push(current);
      openHeading = text;
      continue;
    }

    const target = ensureCurrent();

    switch (s.type) {
      case "sub-heading": {
        flushPendingFor(openHeading);
        const text = s.text as string;
        target.items.push({ kind: "block", block: { kind: "subheading", text } });
        openHeading = text;
        break;
      }
      case "body paragraph":
        target.items.push({ kind: "block", block: { kind: "paragraph", text: s.text as string } });
        break;
      case "credit line":
        target.items.push({ kind: "block", block: { kind: "creditLine", text: s.text as string } });
        break;
      case "caption":
        target.items.push({ kind: "block", block: { kind: "caption", text: s.text as string } });
        break;
      case "pull quote":
        target.items.push({
          kind: "block",
          block: {
            kind: "pullQuote",
            text: Array.isArray(s.text) ? s.text.join(" ") : (s.text as string),
          },
        });
        break;
      case "stat callout":
        target.items.push({ kind: "block", block: { kind: "statCallout", text: s.text as string } });
        break;
      case "external link":
        target.items.push({
          kind: "block",
          block: { kind: "externalLink", text: s.text as string, href: s.href ?? "#" },
        });
        break;
      default:
        break;
    }
  }

  // Whatever's still queued belonged to the last heading/sub-heading opened
  // (or, for a page with no headings at all but a top-level mediaLayout
  // block anchored to `after: null`, gets its own section here).
  flushPendingFor(openHeading);

  if (!layout) {
    // Legacy path: pool each work page's remaining images/videos into the
    // best-matching section by context, one grid per section.
    const images = [...page.images];
    const videos = [...page.videos];
    if (heroImage) images.splice(images.indexOf(heroImage), 1);
    if (heroVideo) videos.splice(videos.indexOf(heroVideo), 1);

    function bestSection(key: string): CaseStudySection | undefined {
      return caseSections.find(
        (sec) =>
          matches(key, sec.heading ?? "") ||
          sec.items.some(
            (it) => it.kind === "block" && it.block.kind === "subheading" && matches(key, it.block.text),
          ),
      );
    }

    const leftover: MediaItem[] = [];
    const bySection = new Map<CaseStudySection, MediaItem[]>();

    for (const img of images) {
      const target = bestSection(contextKey(img.context));
      const list = target ? (bySection.get(target) ?? []) : leftover;
      list.push({ kind: "image", ref: img });
      if (target) bySection.set(target, list);
    }
    for (const vid of videos) {
      const target = bestSection(contextKey(vid.context));
      const list = target ? (bySection.get(target) ?? []) : leftover;
      list.push({ kind: "video", ref: vid });
      if (target) bySection.set(target, list);
    }
    if (leftover.length) {
      const target = ensureCurrent();
      bySection.set(target, [...(bySection.get(target) ?? []), ...leftover]);
    }
    for (const [section, items] of bySection) {
      if (items.length === 0) continue;
      section.items.push({ kind: "media", group: { columns: 2, items } });
    }
  }

  return {
    headline,
    body,
    heroExtraParagraphs,
    credits,
    heroLink,
    heroImage,
    heroVideo,
    sections: caseSections,
    moreWork,
  };
}
