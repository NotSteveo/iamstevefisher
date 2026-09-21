import { workIndex } from "./content";
import type { ImageRef, Section, VideoRef, WorkCard, WorkPageContent } from "./content";

const coverImageByHref = new Map(workIndex.projects.map((p) => [p.href, p.coverImage]));

function withCoverImage(card: WorkCard): WorkCard {
  return card.coverImage ? card : { ...card, coverImage: coverImageByHref.get(card.href) };
}

export type ContentBlock =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "creditLine"; text: string }
  | { kind: "caption"; text: string }
  | { kind: "pullQuote"; text: string }
  | { kind: "statCallout"; text: string }
  | { kind: "externalLink"; text: string; href: string };

export type CaseStudySection = {
  heading?: string;
  blocks: ContentBlock[];
  images: ImageRef[];
  videos: VideoRef[];
};

export type CaseStudy = {
  headline: string;
  body: string;
  credits: string[];
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

  const images = [...page.images];
  const videos = [...page.videos];

  // Hero video takes priority over a hero image (CaseStudyView only renders
  // one or the other). Only pick/remove a hero image when there's no video —
  // otherwise a wrongly-guessed "hero" image gets silently deleted from the
  // page instead of showing up in its real section.
  const heroVideoIdx = videos.findIndex((v) => /hero|intro/i.test(v.context ?? ""));
  // A page with only one video (no keyword match needed) — treat it as the hero
  // rather than burying it in a half-width section grid cell.
  const heroVideo =
    heroVideoIdx >= 0 ? videos[heroVideoIdx] : videos.length === 1 ? videos[0] : undefined;
  if (heroVideo) videos.splice(videos.indexOf(heroVideo), 1);

  let heroImage: ImageRef | undefined;
  if (!heroVideo) {
    const heroImageIdx = images.findIndex((i) => /hero|cover/i.test(i.context ?? ""));
    heroImage = images[heroImageIdx >= 0 ? heroImageIdx : 0];
    if (heroImage) images.splice(images.indexOf(heroImage), 1);
  }

  const caseSections: CaseStudySection[] = [];
  let current: CaseStudySection | null = null;

  for (const s of sections) {
    if (
      s.type === "hero headline" ||
      s.type === "hero body" ||
      s.type === "credits" ||
      s.type === "more work"
    ) {
      continue;
    }

    if (s.type === "section heading") {
      current = { heading: s.text as string, blocks: [], images: [], videos: [] };
      caseSections.push(current);
      continue;
    }

    if (!current) {
      current = { blocks: [], images: [], videos: [] };
      caseSections.push(current);
    }

    switch (s.type) {
      case "sub-heading":
        current.blocks.push({ kind: "subheading", text: s.text as string });
        break;
      case "body paragraph":
        current.blocks.push({ kind: "paragraph", text: s.text as string });
        break;
      case "credit line":
        current.blocks.push({ kind: "creditLine", text: s.text as string });
        break;
      case "caption":
        current.blocks.push({ kind: "caption", text: s.text as string });
        break;
      case "pull quote":
        current.blocks.push({
          kind: "pullQuote",
          text: Array.isArray(s.text) ? s.text.join(" ") : (s.text as string),
        });
        break;
      case "stat callout":
        current.blocks.push({ kind: "statCallout", text: s.text as string });
        break;
      case "external link":
        current.blocks.push({
          kind: "externalLink",
          text: s.text as string,
          href: s.href ?? "#",
        });
        break;
      default:
        break;
    }
  }

  // Assign remaining images/videos to the best-matching section by context.
  const unmatchedImages: ImageRef[] = [];
  for (const img of images) {
    const key = contextKey(img.context);
    const target = caseSections.find(
      (sec) =>
        matches(key, sec.heading ?? "") ||
        sec.blocks.some((b) => b.kind === "subheading" && matches(key, b.text))
    );
    if (target) target.images.push(img);
    else unmatchedImages.push(img);
  }

  const unmatchedVideos: VideoRef[] = [];
  for (const vid of videos) {
    const key = contextKey(vid.context);
    const target = caseSections.find(
      (sec) =>
        matches(key, sec.heading ?? "") ||
        sec.blocks.some((b) => b.kind === "subheading" && matches(key, b.text))
    );
    if (target) target.videos.push(vid);
    else unmatchedVideos.push(vid);
  }

  if (unmatchedImages.length || unmatchedVideos.length) {
    if (caseSections.length > 0) {
      caseSections[caseSections.length - 1].images.push(...unmatchedImages);
      caseSections[caseSections.length - 1].videos.push(...unmatchedVideos);
    } else {
      caseSections.push({ blocks: [], images: unmatchedImages, videos: unmatchedVideos });
    }
  }

  return { headline, body, credits, heroImage, heroVideo, sections: caseSections, moreWork };
}
