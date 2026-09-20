import styles from "./ContactSection.module.css";
import ContactForm from "./ContactForm";

const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ39CWkOFCX7GfBQSP8HPETo33A4QZXblZwQognRfOxCvG0T8TWV06j3AOfU0gxn2v1Oix5B9BdC?gv=true";

export default function ContactSection({
  headline,
  subline,
  compact = false,
}: {
  headline: string;
  subline?: string;
  compact?: boolean;
}) {
  return (
    <section className={`${styles.section} ${compact ? styles.compact : ""}`}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.content}>
          <div className={styles.textWrap}>
            <h2 className={styles.headline}>{headline}</h2>
            {subline ? <p className={styles.subline}>{subline}</p> : null}
          </div>

          <div className={styles.formBlock}>
            <ContactForm />
            <div className={styles.bookRow}>
              <p className={styles.bookText}>OR setup an appointment on Google Meet.</p>
              <a
                className={styles.bookButton}
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Book an appointment
              </a>
            </div>
          </div>
        </div>

        <div className={styles.hr} />

        <div className={styles.lower}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Fisher Creative. All Rights Reserved
          </p>
        </div>
      </div>
    </section>
  );
}
