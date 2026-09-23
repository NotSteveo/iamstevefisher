"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./WorkTabs.module.css";

// Split out from the card grid (WorkScrollList) so it can sit inline next
// to the "Work" heading instead of stacked below it — both read/write the
// same ?category= query param, so no state needs to be shared between them
// directly.
export default function WorkTabs({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const active = useMemo(() => {
    const value = searchParams.get("category");
    if (!value) return categories[0] ?? "All projects";
    const match = categories.find((c) => c.toLowerCase() === value.toLowerCase());
    return match ?? categories[0] ?? "All projects";
  }, [searchParams, categories]);

  function selectCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All projects") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    const query = params.toString();
    router.replace(query ? `/work?${query}` : "/work", {
      scroll: false,
    });
  }

  return (
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
  );
}
