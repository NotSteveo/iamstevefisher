import Image from "next/image";
import { asset } from "@/lib/assets";
import { about } from "@/lib/content";
import AboutGiantList from "./AboutGiantList";
import RevealText from "./RevealText";
import styles from "./AboutHuman.module.css";

const HOBBIES_INTRO = about.sections.find((s) => s.type === "list heading")?.text as string;
const HOBBIES = ((about.sections.find((s) => s.type === "list")?.text as string[]) ?? []).map(
  (heading) => ({ heading }),
);
const CAPTION = about.sections.find((s) => s.type === "caption")?.text as string;

export default function AboutHuman() {
  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <RevealText as="p" className={styles.eyebrow} from="left">
          {HOBBIES_INTRO}
        </RevealText>
        <AboutGiantList items={HOBBIES} />
        <RevealText as="p" className={styles.caption} from="left">
          {CAPTION}
        </RevealText>

        <div className={styles.photoGrid}>
          {about.images
            .filter((img) => img.context?.startsWith("about photo"))
            .map((img) => (
              <RevealText className={styles.photoWrap} from="left" key={img.url}>
                <Image
                  src={asset(img.url)}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className={styles.photo}
                />
              </RevealText>
            ))}
        </div>
      </div>
    </section>
  );
}
