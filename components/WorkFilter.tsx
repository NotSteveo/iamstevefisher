"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WorkCard from "./WorkCard";
import type { WorkCard as WorkCardType } from "@/lib/content";
import styles from "./WorkFilter.module.css";

export default function WorkFilter({
  categories,
  projects,
  categoryMembership,
}: {
  categories: string[];
  projects: WorkCardType[];
  categoryMembership: Record<string, string[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derived straight from the URL on every render — no local state to drift
  // out of sync when a tag link updates the query without remounting this
  // component (e.g. clicking a tag while already on /work).
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

  function selectCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All projects") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    const query = params.toString();
    router.replace(query ? `/work?${query}` : "/work", { scroll: false });
  }

  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            className={`${styles.tab} ${active === cat ? styles.tabActive : ""}`}
            onClick={() => selectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visible.map((project) => (
          <WorkCard key={project.slug ?? project.href} project={project} />
        ))}
      </div>
    </div>
  );
}
