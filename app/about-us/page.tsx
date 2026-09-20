import type { Metadata } from "next";
import Image from "next/image";
import { about } from "@/lib/content";
import { asset } from "@/lib/assets";
import ContactSection from "@/components/ContactSection";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "I am Steve Fisher - About",
  description: about.metaDescription ?? undefined,
};

export default function AboutPage() {
  const heroHeadline = about.sections.find((s) => s.type === "hero headline")?.text as string;
  const skillCards = about.sections.filter((s) => s.type === "skill card");
  const pullQuote = about.sections.find((s) => s.type === "pull quote")?.text as string[];
  const bodyParas = about.sections.filter((s) => s.type === "body paragraph");
  const logoLists = about.sections.filter((s) => s.type === "logo/company list");
  const listHeading = about.sections.find((s) => s.type === "list heading")?.text as string;
  const list = about.sections.find((s) => s.type === "list")?.text as string[];
  const caption = about.sections.find((s) => s.type === "caption")?.text as string;
  const photos = about.images.filter((i) => i.context?.includes("about photo"));

  return (
    <main>
      <section className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.headline}>{heroHeadline}</h1>
        </div>
      </section>

      {photos.length > 0 ? (
        <section className={styles.photoRow}>
          <div className={`wrap ${styles.photoGrid}`}>
            {photos.map((photo) => (
              <div key={photo.url} className={styles.photoWrap}>
                <Image
                  src={asset(photo.url)}
                  alt="Steve Fisher"
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className={styles.photo}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.skills}>
        <div className={`wrap ${styles.skillGrid}`}>
          {skillCards.map((card) => (
            <div key={card.heading} className={styles.skillCard}>
              <h3 className={styles.skillHeading}>{card.heading}</h3>
              <p className={styles.skillText}>{card.text as string}</p>
            </div>
          ))}
        </div>
      </section>

      {pullQuote ? (
        <section className={styles.quoteSection}>
          <div className="wrap">
            <blockquote className={styles.pullQuote}>
              {pullQuote.map((line) => (
                <span key={line} className={styles.quoteLine}>
                  {line}
                </span>
              ))}
            </blockquote>
          </div>
        </section>
      ) : null}

      <section className={styles.storySection}>
        <div className={`wrap ${styles.storyColumn}`}>
          {bodyParas[0] ? <p className={styles.paragraph}>{bodyParas[0].text as string}</p> : null}
          {bodyParas[1] ? <p className={styles.paragraph}>{bodyParas[1].text as string}</p> : null}
          {logoLists[0] ? (
            <div className={styles.logoList}>
              {(logoLists[0].text as string[]).map((name) => (
                <span key={name} className={styles.logoName}>
                  {name}
                </span>
              ))}
            </div>
          ) : null}
          {bodyParas[2] ? <p className={styles.paragraph}>{bodyParas[2].text as string}</p> : null}
          {logoLists[1] ? (
            <div className={styles.logoList}>
              {(logoLists[1].text as string[]).map((name) => (
                <span key={name} className={styles.logoName}>
                  {name}
                </span>
              ))}
            </div>
          ) : null}
          {bodyParas[3] ? <p className={styles.paragraph}>{bodyParas[3].text as string}</p> : null}
        </div>
      </section>

      {list ? (
        <section className={styles.listSection}>
          <div className="wrap">
            <h3 className={styles.listHeading}>{listHeading}</h3>
            <ul className={styles.list}>
              {list.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
            {caption ? <p className={styles.caption}>{caption}</p> : null}
          </div>
        </section>
      ) : null}

      <ContactSection headline="Don't leave me on read." subline="Say hello." />
    </main>
  );
}
