import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

const links = [
  { href: "/work", label: "Work" },
  { href: "/ai-musings", label: "AI Musings" },
  { href: "/about-us", label: "About" },
];

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={`wrap ${styles.navWrapper}`}>
        <Link href="/" aria-label="home" className={styles.logoLink}>
          <Image src="/images/logo.svg" alt="Logo" width={32} height={30} priority />
        </Link>

        <nav className={styles.navMenu} aria-label="primary">
          <div className={styles.menuWrapper}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navBlock}>
                <span className={styles.navLinkText}>{link.label}</span>
              </Link>
            ))}
          </div>

          <Link href="/contact" className={styles.contactButton}>
            Get in touch
          </Link>
        </nav>
      </div>
    </header>
  );
}
