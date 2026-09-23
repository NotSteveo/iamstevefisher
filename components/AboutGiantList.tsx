import RevealText from "./RevealText";
import styles from "./AboutGiantList.module.css";

export type AboutGiantListItem = { heading: string; caption?: string };

// The one repeated visual signature of the current Webflow about page —
// a stack of huge Outfit headlines, each with an optional small caption
// underneath. Reused for skills (with captions), career, freelance, and
// hobbies (no captions), plus a single-item list for the "Curiosity keeps
// me living." punchline in AboutPath. Each item gets its own RevealText,
// sliding in from the left as it scrolls into view, so a long list
// reveals one row at a time instead of appearing all at once.
export default function AboutGiantList({ items }: { items: AboutGiantListItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <RevealText className={styles.item} from="left" key={item.heading}>
          <div className={styles.heading}>{item.heading}</div>
          {item.caption ? <p className={styles.caption}>{item.caption}</p> : null}
        </RevealText>
      ))}
    </div>
  );
}
