import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkPage, workPageSlugs } from "@/lib/content";
import { buildCaseStudy } from "@/lib/caseStudy";
import DarkNav from "@/components/DarkNav";
import CaseStudyView from "@/components/CaseStudyView";
import PageContactSection from "@/components/PageContactSection";

export function generateStaticParams() {
  return workPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getWorkPage(slug);
  if (!page) return {};
  return { title: page.title, description: page.metaDescription ?? undefined };
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getWorkPage(slug);
  if (!page) notFound();

  const study = buildCaseStudy(page);

  return (
    <>
      <DarkNav />
      <CaseStudyView study={study} />
      <PageContactSection />
    </>
  );
}
