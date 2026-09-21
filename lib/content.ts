import raw from "@/data/content.json";

export type Section = {
  type: string;
  text?: string | string[];
  heading?: string;
  sectionTitle?: string;
  href?: string;
  projects?: WorkCard[];
};

export type WorkCard = {
  slug?: string;
  title: string;
  href: string;
  tags: string[];
  coverImage?: string;
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
};

export type WorkIndexContent = PageContent & {
  categories: string[];
  projects: WorkCard[];
  categoryMembership: Record<string, string[]>;
};

export type WorkPageContent = PageContent;

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
