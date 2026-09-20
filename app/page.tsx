import { home } from "@/lib/content";
import WorkCard from "@/components/WorkCard";
import ContactSection from "@/components/ContactSection";
import RevealText from "@/components/RevealText";
import styles from "./page.module.css";

export default function Home() {
  const heroText = home.sections.find((s) => s.type === "hero")?.text as string[];
  const [headline, role1, role2, role3, role4, bio, current] = heroText;
  const featured = home.sections.find((s) => s.type === "featured work");

  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <RevealText as="h1" className={styles.headline}>
            {headline}
          </RevealText>

          <div className={styles.heroBottom}>
            <p className={styles.roles}>
              {role1}
              <br />
              {role2}
              <br />
              {role3}
              <br />
              {role4}
            </p>
            <div className={styles.bio}>
              <p>{bio}</p>
              <p className={styles.current}>{current}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className="wrap">
          <h2 className={styles.featuredTitle}>{featured?.sectionTitle}</h2>
          <div className={styles.grid}>
            {featured?.projects?.map((project) => (
              <WorkCard key={`${project.href}-${project.title}`} project={project} />
            ))}
          </div>
        </div>
      </section>

      <ContactSection headline="Don't leave me on read." subline="Say hello." />
    </main>
  );
}
