import { about } from "@/lib/content";
import AboutGiantList from "./AboutGiantList";
import RevealText from "./RevealText";
import styles from "./AboutPath.module.css";

// The about page's "body paragraph" sections all read in one fixed order:
// the horizon line, the career intro, then (after the career list) the
// freelance intro, then (after the freelance list) the trailer line. Pulled
// by position rather than by some more specific type, since the data has
// no finer-grained tag than "body paragraph" for telling them apart.
const PARAGRAPHS = about.sections.filter((s) => s.type === "body paragraph") as {
  text: string;
}[];
const [HORIZON, CAREER_INTRO, FREELANCE_INTRO, TRAILER] = PARAGRAPHS.map((s) => s.text);

const [PULL_QUOTE_SMALL, PULL_QUOTE_BIG] = about.sections.find((s) => s.type === "pull quote")
  ?.text as string[];

const COMPANY_LISTS = about.sections.filter((s) => s.type === "logo/company list") as {
  text: string[];
}[];
const CAREER_COMPANIES = (COMPANY_LISTS[0]?.text ?? []).map((heading) => ({ heading }));
const FREELANCE_CLIENTS = (COMPANY_LISTS[1]?.text ?? []).map((heading) => ({ heading }));

export default function AboutPath() {
  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <RevealText as="p" className={styles.eyebrow} from="left">
          {PULL_QUOTE_SMALL}
        </RevealText>
        <RevealText as="blockquote" className={styles.pullQuote} from="left">
          {PULL_QUOTE_BIG}
        </RevealText>

        <RevealText as="p" className={`${styles.paragraph} ${styles.spaced}`} from="left">
          {HORIZON}
        </RevealText>

        <RevealText as="p" className={styles.paragraph} from="left">
          {CAREER_INTRO}
        </RevealText>
        <AboutGiantList items={CAREER_COMPANIES} />

        <RevealText as="p" className={styles.paragraph} from="left">
          {FREELANCE_INTRO}
        </RevealText>
        <AboutGiantList items={FREELANCE_CLIENTS} />

        <RevealText as="p" className={styles.paragraph} from="left">
          {TRAILER}
        </RevealText>
      </div>
    </section>
  );
}
