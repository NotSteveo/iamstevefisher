import { home, type WorkCard as WorkCardType } from "@/lib/content";
import WorkCard from "@/components/WorkCard";
import LogoStrip from "@/components/LogoStrip";
import ContactSection from "@/components/ContactSection";
import HeroHeadline from "@/components/HeroHeadline";
import HeroVisual from "@/components/HeroVisual";
import styles from "./page.module.css";

// Curated order for the homepage: strongest / most on-brand work first,
// role-framed to match what each project's own credits actually say (Steve
// is Art Direction/Motion on the Quantum Metric team pieces, not the credited
// Creative Director on them — see each case study's credits block).
// LEAP 2026 is deliberately excluded: it has no dedicated case study page yet.
const CURATED_ORDER = [
  {
    href: "/work/quantum-metric-felix-ai-campaign",
    roleLine: "Art direction, motion & illustration for Quantum Metric's first AI product launch",
  },
  {
    href: "/work/quantum-metric-leap-2025",
    roleLine: "Art direction, motion & video for a 3-day flagship conference in Phoenix",
  },
  {
    href: "/work/quantum-metric-peak-benchmark-report",
    roleLine: "Art direction, motion & design for an interactive industry benchmark report",
  },
  {
    href: "/work/quantum-metric-leap-2023",
    roleLine: "Art direction & motion for Quantum Metric's first fully in-house flagship conference",
  },
  {
    href: "/work/quantum-metric-web-design",
    roleLine: "Web design & motion for a component-driven rebuild that lifted qualified leads",
  },
];

// Draft positioning headline — ties directly to Felix AI, the project
// featured right beside it. Swap freely; this is a placeholder pending sign-off.
const HERO_HEADLINE = "I give AI products a personality they didn't ask for.";

export default function Home() {
  const heroText = home.sections.find((s) => s.type === "hero")?.text as string[];
  const [, role1, role2, role3, role4, bio, current] = heroText;
  const featured = home.sections.find((s) => s.type === "featured work");
  const projectsByHref = new Map((featured?.projects ?? []).map((p) => [p.href, p]));

  const curated = CURATED_ORDER.map(({ href, roleLine }) => {
    const project = projectsByHref.get(href);
    return project ? { project, roleLine } : null;
  }).filter((c): c is { project: WorkCardType; roleLine: string } => c !== null);

  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroTop}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Steve Fisher — Creative Director</p>
              <HeroHeadline text={HERO_HEADLINE} className={styles.headline} />
            </div>
            <HeroVisual />
          </div>

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

      <LogoStrip />

      <section className={styles.featured}>
        <div className="wrap">
          <h2 className={styles.featuredTitle}>{featured?.sectionTitle}</h2>
          <div className={styles.grid}>
            {curated.map(({ project, roleLine }) => (
              <WorkCard
                key={`${project.href}-${project.title}`}
                project={project}
                roleLine={roleLine}
              />
            ))}
          </div>
        </div>
      </section>

      <ContactSection headline="Don't leave me on read." subline="Say hello." />
    </main>
  );
}
