import Image from "next/image";
import styles from "./LogoStrip.module.css";

export type Company = {
  name: string;
  logo?: string;
};

const companies: Company[] = [
  { name: "Quantum Metric" },
  { name: "Adobe Workfront" },
  { name: "Lucid Software" },
  { name: "CBS" },
  { name: "Snapchat" },
];

export default function LogoStrip() {
  return (
    <section className={styles.strip}>
      <div className="wrap">
        <p className={styles.label}>In-house &amp; freelance work for</p>
        <div className={styles.row}>
          {companies.map((company) => (
            <div key={company.name} className={styles.item}>
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={140}
                  height={40}
                  className={styles.logoImage}
                />
              ) : (
                <span className={styles.wordmark}>{company.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
