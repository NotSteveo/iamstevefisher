"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import styles from "./PageContactSection.module.css";

type Status = "idle" | "sending" | "success" | "error";

// Cycles through the second half of "Let's make it ___" — "possible" (the
// site's own tagline) sits alongside a few other words so the line still
// reads true no matter which one is showing when someone lands here.
const WORDS = ["Beautiful", "Creative", "Scalable", "Memorable", "Possible", "Effective"];
const WORD_INTERVAL_MS = 2400;

// A dark-themed contact form for this page — same /api/contact endpoint and
// payload shape as the site-wide ContactForm, just restyled to fit this
// page's black/mono/green look instead of the light site's own theme.
//
// `fullHeight` is opt-in: the contact-scroll page is nothing but this
// section, so it needs to fill the viewport with the footer bar pinned to
// the bottom and the form vertically centered above it. The other four
// pages (hero/about/work/case-study) use this as a closing CTA after a lot
// of their own content, where that treatment doesn't apply.
export default function PageContactSection({ fullHeight = false }: { fullHeight?: boolean } = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, WORD_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={`${styles.section} ${fullHeight ? styles.fullHeight : ""}`}>
      <div className={`wrap ${fullHeight ? styles.contentWrap : ""}`}>
        <div className={styles.grid}>
          <div className={styles.textWrap}>
            <h2 className={styles.headline}>
              <span className={styles.headlineLead}>Let&apos;s make it</span>
              {/* key forces a remount on every word change, restarting the
                  CSS entrance animation instead of just swapping text. */}
              <span className={styles.headlineWord} key={wordIndex}>
                {WORDS[wordIndex]}
              </span>
            </h2>
          </div>

          {status === "success" ? (
            <div className={styles.message}>
              <p>Thank you! Your submission has been received!</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="pc-name" className={styles.label}>
                  Name
                </label>
                <input
                  id="pc-name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="pc-email" className={styles.label}>
                  Email
                </label>
                <input
                  id="pc-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="pc-message" className={styles.label}>
                  Your Message
                </label>
                <input
                  id="pc-message"
                  name="message"
                  type="text"
                  placeholder="Enter your message"
                  className={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submit}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>

              {status === "error" ? (
                <p className={styles.error}>
                  Oops! Something went wrong while submitting the form.
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>

      <div className={styles.footerBar}>
        <p className={styles.footerName}>I am Steve Fisher.</p>
        <Image
          src="/images/logo-dark.svg"
          alt="Logo"
          width={24}
          height={28}
          className={styles.footerLogo}
        />
        <p className={styles.footerCopyright}>
          © {new Date().getFullYear()} Fisher Creative. All Rights Reserved
        </p>
      </div>
    </section>
  );
}
