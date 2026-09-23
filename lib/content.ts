import raw from "@/data/content.json";

export type Section = {
  type: string;
  text?: string | string[];
  heading?: string;
  sectionTitle?: string;
  href?: string;
  projects?: WorkCard[];
  // "figure" sections only: the image, its caption (text), and its real
  // pixel dimensions (next/image needs these up front for a non-fill,
  // intrinsic-aspect-ratio image — see ArticleBlock in
  // app/ai-musings/[slug]/page.tsx).
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
};

export type WorkCard = {
  slug?: string;
  title: string;
  href: string;
  tags: string[];
  coverImage?: string;
  // AI Musings cards only, so far — when set, the card autoplays this
  // instead of showing coverImage as a static thumbnail (coverImage still
  // serves as its poster frame). Matches how the live site treats
  // howtobrandai.com's card: the same hero video as its post page, looping.
  coverVideoMp4?: string;
  coverVideoWebm?: string;
  note?: string;
};

export type ImageRef = { url: string; context?: string };
export type VideoRef = {
  type: string;
  mp4?: string;
  webm?: string;
  poster?: string;
  context?: string;
  src?: string;
  title?: string;
};

export type PageContent = {
  title: string;
  metaDescription?: string | null;
  sections: Section[];
  images: ImageRef[];
  videos: VideoRef[];
  // AI Musings posts only, so far — a single hero video shown right under
  // the intro, the same treatment as a case study's heroVideo. Unlike
  // WorkPageContent's mediaLayout, there's no block system here yet, so
  // this is just the one VideoRef directly rather than a URL to look up.
  heroVideo?: VideoRef;
};

export type WorkIndexContent = PageContent & {
  categories: string[];
  projects: WorkCard[];
  categoryMembership: Record<string, string[]>;
};

// Precise media layout reverse-engineered from the live Webflow site
// (i-am-steve-fisher-bd14e5.webflow.io) — the crawl that produced `images`/
// `videos` above flattened each page's media into two context-tagged lists,
// losing which images/videos were grouped into the same visual row and how
// many columns that row had. `mediaLayout` restores that: `hero` picks the
// single full-bleed media item (an images[].url or videos[].mp4/src), and
// each block is one grid — `after` is the section/sub-heading text it
// renders beneath (matched against Section.text below), `columns` is that
// grid's real column count, and `items` are images[].url/videos[].mp4/src
// values, in row order. Multiple blocks can share the same `after`; they
// render in array order, each as its own grid, all before the next heading.
// `widths`, when present, is one relative fr-unit per item (e.g. a 1:1:1:1:1:6
// row of five equal swatches beside one much wider logo card) — several of
// Webflow's own grids use bespoke per-page column ratios, not an even split,
// so `columns` alone can't reproduce them. Omit it for an even repeat(columns,1fr)
// grid; its length must equal `items.length` when present.
// `anchorAspect`, when present, is the real natural [width, height] pixel
// dimensions of this block's reference item (see `anchorIndex`) — Webflow
// doesn't crop its grid images to a fixed box at all; a plain <img> renders
// at its own real aspect ratio (width = column width, height: auto) and
// that becomes the row's height, with every other item in the row
// absolutely positioned + object-fit: cover to match it (cropping only the
// items that don't already share that ratio). Without this the row falls
// back to a generic 4:3 guess, which can crop most or all of a row's real
// content far too tight — verified against Webflow, this was previously
// happening on the large majority of this site's media grids, not just
// the handful of bespoke `widths` rows it was first built for.
// `anchorIndex` is the position within `items` that `anchorAspect` was
// measured from — usually the item whose ratio the most other items in
// the row already share (Webflow's own real reference), not necessarily
// item 0. Omit it when that reference is item 0 (the common case).
export type MediaLayoutBlock = {
  after: string | null;
  columns: number;
  widths?: number[];
  anchorAspect?: [number, number];
  anchorIndex?: number;
  items: string[];
};
export type MediaLayout = { hero?: string; blocks: MediaLayoutBlock[] };

export type WorkPageContent = PageContent & { mediaLayout?: MediaLayout };

type ContentRoot = {
  home: PageContent;
  work_index: WorkIndexContent;
  about: PageContent;
  contact: PageContent;
  ai_musings_index: PageContent & { posts: WorkCard[] };
  ai_musings_posts: Record<string, PageContent>;
  work_pages: Record<string, WorkPageContent>;
};

const content = raw as unknown as ContentRoot;

function withHref(card: WorkCard): WorkCard {
  return card.href ? card : { ...card, href: `/work/${card.slug}` };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * A few crawled "featured work" cards are missing `coverImage` even though
 * the matching image exists in the page's `images` list (e.g. home's LEAP
 * 2026 and Web refresh cards). Backfill by matching the card title against
 * each image's context string.
 */
function backfillFeaturedWorkImages(page: PageContent): PageContent {
  const sections = page.sections.map((section) => {
    if (section.type !== "featured work" || !section.projects) return section;
    const projects = section.projects.map((p) => {
      if (p.coverImage) return p;
      const normTitle = normalize(p.title);
      const match = page.images.find((img) => {
        if (!img.context) return false;
        const normContext = normalize(img.context);
        return normContext.includes(normTitle) || normTitle.includes(normContext);
      });
      return match ? { ...p, coverImage: match.url } : p;
    });
    return { ...section, projects };
  });
  return { ...page, sections };
}

function slugFromHref(href: string): string {
  return href.replace(/^\/work\//, "");
}

/**
 * Last-resort fallback: if a card still has no coverImage after the context
 * match above, borrow the first image from its own case study page (e.g.
 * Peak Benchmark Report has no dedicated "cover" image, but its case study
 * has a strong opening gallery shot we can reuse).
 */
function withCaseStudyCoverFallback(card: WorkCard): WorkCard {
  if (card.coverImage) return card;
  const page = content.work_pages[slugFromHref(card.href)];
  const fallback = page?.images[0]?.url;
  return fallback ? { ...card, coverImage: fallback } : card;
}

function backfillHomeFeatured(page: PageContent): PageContent {
  const sections = page.sections.map((section) => {
    if (section.type !== "featured work" || !section.projects) return section;
    return { ...section, projects: section.projects.map(withCaseStudyCoverFallback) };
  });
  return { ...page, sections };
}

export const home = backfillHomeFeatured(backfillFeaturedWorkImages(content.home));
export const workIndex: WorkIndexContent = {
  ...content.work_index,
  projects: content.work_index.projects.map(withHref).map(withCaseStudyCoverFallback),
};
export const about = content.about;
export const contact = content.contact;
export const aiMusingsIndex = content.ai_musings_index;
export const aiMusingsPosts = content.ai_musings_posts;
export const workPages = content.work_pages;

export function getWorkPage(slug: string): WorkPageContent | undefined {
  return workPages[slug];
}

export function getAiMusingsPost(slug: string): PageContent | undefined {
  return aiMusingsPosts[slug];
}

export function workPageSlugs(): string[] {
  return Object.keys(workPages);
}

export function aiMusingsSlugs(): string[] {
  return Object.keys(aiMusingsPosts);
}
