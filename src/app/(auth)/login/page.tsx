import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Boxes,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { LoginForm } from "@/features/auth/components/login-form";
import styles from "@/features/auth/components/login.module.css";

export const metadata: Metadata = {
  title: "Kirish",
  description: `${siteConfig.name} kabinetiga kirish.`,
  robots: { index: false, follow: true },
};

const benefits = [
  {
    icon: Boxes,
    title: "Ombor va FIFO",
    description: "Qoldiq va haqiqiy tan narx doim nazoratda.",
  },
  {
    icon: BarChart3,
    title: "Foyda va xarajat",
    description: "Komissiyadan keyingi sof natijani ko‘ring.",
  },
  {
    icon: SearchCheck,
    title: "SEO va o‘sish",
    description: "Tovar kartalarini tahlil qilib, tezroq o‘stiring.",
  },
] as const;

export default function LoginPage() {
  return (
    <div className={`${styles.page} landing-light`}>
      <a className={styles.skipLink} href="#login-panel">
        Kirish paneliga o‘tish
      </a>

      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.glow} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brandLink} aria-label="eStats bosh sahifasi">
            <span className={styles.logoWell}>
              <LogoMark size={34} priority className={styles.logo} />
            </span>
            <span className={styles.brandCopy}>
              <strong>{siteConfig.name}</strong>
              <span>Seller analytics</span>
            </span>
          </Link>

          <Link href="/" className={styles.homeLink}>
            <ArrowLeft aria-hidden="true" />
            <span>Bosh sahifa</span>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="login-heading">
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Uzum sotuvchilari uchun
          </div>
          <h1 id="login-heading" className={styles.title}>
            Savdoni taxmin bilan emas, <span>aniq raqamlar bilan</span> boshqaring.
          </h1>
          <p className={styles.lead}>
            Ombor, moliya, SEO va real foyda — kundalik qarorlar uchun tartibli bitta
            kabinetda.
          </p>

          <div className={styles.benefits}>
            {benefits.map(({ icon: Icon, title, description }) => (
              <div className={styles.benefit} key={title}>
                <span className={styles.benefitIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewTopbar}>
              <div className={styles.windowDots}>
                <span />
                <span />
                <span />
              </div>
              <span className={styles.previewBrand}>Bugungi natija</span>
              <span className={styles.liveBadge}>
                <i /> Jonli
              </span>
            </div>

            <div className={styles.previewBody}>
              <div className={styles.previewMetrics}>
                <div className={styles.metricCard}>
                  <span>Sof foyda</span>
                  <strong>12 480 000</strong>
                  <small>+18.4% bu oy</small>
                </div>
                <div className={styles.metricCard}>
                  <span>Buyurtmalar</span>
                  <strong>1 284</strong>
                  <small>+146 ta yangi</small>
                </div>
                <div className={styles.metricCard}>
                  <span>Ombor qiymati</span>
                  <strong>86.2 mln</strong>
                  <small>FIFO bo‘yicha</small>
                </div>
              </div>

              <div className={styles.previewChart}>
                <div className={styles.chartCopy}>
                  <span>Foyda dinamikasi</span>
                  <strong>Barqaror o‘sish</strong>
                </div>
                <div className={styles.chartBars}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.chartFooter}>
                  <span>1-sen</span>
                  <span>Bugun</span>
                </div>
              </div>

              <div className={styles.previewInsight}>
                <span className={styles.insightIcon}>
                  <ArrowUpRight />
                </span>
                <span>
                  <strong>Eng yaxshi natija</strong>
                  <small>Marja kechagidan 6.8% yuqori</small>
                </span>
                <ShieldCheck className={styles.insightShield} />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.authColumn} id="login-panel">
          <LoginForm />
          <p className={styles.supportCopy}>
            Kirishda muammo bormi?{" "}
            <a href={`mailto:turaqulovfayoz4@gmail.com?subject=${siteConfig.name}%20login`}>
              Yordam olish
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
