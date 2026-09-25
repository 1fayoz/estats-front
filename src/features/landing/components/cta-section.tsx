import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import shared from "./landing.module.css";
import styles from "./landing-pricing.module.css";

export type CtaLocale = "uz" | "ru" | "en";

interface CtaCopy {
  eyebrow: string;
  titleStart: string;
  titleAccent: string;
  description: string;
  button: string;
  link: string;
}

const CTA_COPIES: Record<CtaLocale, CtaCopy> = {
  uz: {
    eyebrow: "Keyingi qadam — sizniki",
    titleStart: "Keyingi qarorni taxmin bilan emas, ",
    titleAccent: "raqam bilan qiling.",
    description: "Marketpleys do'konlaringizni ulang yoki tizim imkoniyatlarini sinab ko'ring. Savdo, ombor va sof foydani bir joyda boshqaring.",
    button: "Boshlash",
    link: "Imkoniyatlarni ko'rish",
  },
  ru: {
    eyebrow: "Следующий шаг — за вами",
    titleStart: "Принимайте решения на основе ",
    titleAccent: "точных цифр, а не догадок.",
    description: "Подключите магазины с маркетплейсов или протестируйте возможности системы. Продажи, склад и чистая прибыль в одном окне.",
    button: "Начать бесплатно",
    link: "Все возможности",
  },
  en: {
    eyebrow: "Your next move",
    titleStart: "Make decisions based on ",
    titleAccent: "hard numbers, not guesswork.",
    description: "Connect your marketplace stores or test the system out. Manage sales, warehouse inventory, and true net profit in one place.",
    button: "Get Started Free",
    link: "Explore Features",
  },
};

export function CtaSection({ locale = "uz" }: { locale?: CtaLocale }) {
  const t = CTA_COPIES[locale] || CTA_COPIES.uz;

  return (
    <section className={styles.cta} aria-labelledby="cta-heading">
      <div className={shared.container}>
        <div className={styles.ctaPanel}>
          <div className={styles.ctaContent}>
            <p className={styles.ctaEyebrow}>{t.eyebrow}</p>
            <h2 id="cta-heading">
              {t.titleStart}
              <span>{t.titleAccent}</span>
            </h2>
            <p className={styles.ctaDescription}>{t.description}</p>
            <div className={styles.ctaActions}>
              <Link href="/login" className={styles.ctaButton}>
                {t.button} <ArrowRight aria-hidden="true" />
              </Link>
              <a href="#imkoniyatlar" className={styles.ctaLink}>
                {t.link} <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.ctaMark} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
