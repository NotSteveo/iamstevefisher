import { about } from "@/lib/content";
import AboutGiantList from "./AboutGiantList";
import styles from "./AboutSkills.module.css";

const SKILLS = about.sections
  .filter((s) => s.type === "skill card")
  .map((s) => ({ heading: s.heading as string, caption: s.text as string }));

export default function AboutSkills() {
  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <AboutGiantList items={SKILLS} />
      </div>
    </section>
  );
}
