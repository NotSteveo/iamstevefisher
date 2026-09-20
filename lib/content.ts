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

export const home = content.home;
export const workIndex: WorkIndexContent = {
  ...content.work_index,
  projects: content.work_index.projects.map(withHref),
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
