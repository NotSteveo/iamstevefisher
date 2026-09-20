"use client";

import { useMemo, useState } from "react";
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
  const [active, setActive] = useState(categories[0] ?? "All projects");

  const visible = useMemo(() => {
    if (active === "All projects" || !categoryMembership[active]) return projects;
    const slugs = new Set(categoryMembership[active]);
    return projects.filter((p) => p.slug && slugs.has(p.slug));
  }, [active, projects, categoryMembership]);

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
            onClick={() => setActive(cat)}
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
