"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { WorkCard as WorkCardType } from "@/lib/content";
import WorkCard from "./WorkCard";
import styles from "./WorkScrollList.module.css";

// The card grid — WorkTabs (rendered separately, inline next to the
// page's own "Work" heading) owns the category filter UI via its own
// ?category= query param, which this reads.
export default function WorkScrollList({
  categories,
  projects,
  categoryMembership,
}: {
  categories: string[];
  projects: WorkCardType[];
  categoryMembership: Record<string, string[]>;
}) {
  const searchParams = useSearchParams();

  const active = useMemo(() => {
    const value = searchParams.get("category");
    if (!value) return categories[0] ?? "All projects";
    const match = categories.find((c) => c.toLowerCase() === value.toLowerCase());
    return match ?? categories[0] ?? "All projects";
  }, [searchParams, categories]);

  const visible = useMemo(() => {
    if (active === "All projects" || !categoryMembership[active]) return projects;
    const slugs = new Set(categoryMembership[active]);
    return projects.filter((p) => p.slug && slugs.has(p.slug));
  }, [active, projects, categoryMembership]);

  // Same card the live /work page uses (components/WorkCard.tsx), just
  // its existing dark variant — the one already built for the "More Work"
  // rows on the dark case-study pages.
  return (
    <div className={styles.grid}>
      {visible.map((project) => (
        <WorkCard key={project.slug ?? project.href} project={project} dark />
      ))}
    </div>
  );
}
