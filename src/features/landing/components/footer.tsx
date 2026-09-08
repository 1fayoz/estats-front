import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={cn(base.container, styles.footerGrid)}>
        <div className={styles.footerIntro}>
          <Link href="/" className={styles.logo} aria-label="eStats — bosh sahifa"><LogoMark size={34} /><span>{siteConfig.name}</span></Link>
          <p>Uzum sotuvchisi uchun tovarlar, moliya va o‘sish imkoniyatlari — bir joyda.</p>
          <a href={siteConfig.botUrl} target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>Telegram botini ochish<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (yangi oynada)</span></a>
        </div>

        <nav aria-label="Mahsulot haqida" className={styles.footerNav}>
          <h3>Mahsulot</h3>
          <Link href="#imkoniyatlar">Imkoniyatlar</Link>
          <Link href="#mahsulot">Qanday ishlaydi</Link>
          <Link href="#narxlar">Narxlar</Link>
          <Link href="#savollar">Savollar</Link>
        </nav>

        <nav aria-label="Hisob va hujjatlar" className={styles.footerNav}>
          <h3>Foydali havolalar</h3>
          <Link href="/login">Hisobga kirish</Link>
          <Link href="/terms">Foydalanish shartlari</Link>
          <Link href="/privacy">Maxfiylik siyosati</Link>
        </nav>
      </div>

      <div className={cn(base.container, styles.footerBottom)}>
        <span>© {new Date().getFullYear()} {siteConfig.name}.</span>
        <span>Uzum Market sotuvchilari uchun mustaqil servis.</span>
      </div>
    </footer>
  );
}
