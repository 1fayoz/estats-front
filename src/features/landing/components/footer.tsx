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
          <p>Marketpleys sotuvchilari uchun tovarlar, moliya va o‘sish imkoniyatlari — bir joyda.</p>
          <a href={siteConfig.botUrl} target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>Telegram botini ochish<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (yangi oynada)</span></a>
        </div>

        <nav aria-label="Yechimlar va xizmatlar" className={styles.footerNav}>
          <h3>Yechimlar</h3>
          <Link href="/yechimlar/ombor">Ombor va partiyalar</Link>
          <Link href="/yechimlar/moliya">Moliya va FIFO tan narx</Link>
          <Link href="/yechimlar/bozor">Bozor va nishalar</Link>
          <Link href="/yechimlar/tovar-seo">AI Tovar SEO</Link>
          <Link href="/yechimlar/marketing">Marketing va DRR</Link>
          <Link href="/yechimlar/multi-market">Multi-Market boshqaruv</Link>
          <Link href="/yechimlar/telegram-instagram">Telegram va Instagram</Link>
          <Link href="/yechimlar/uzum-lens">eStats Lens kengaytmasi</Link>
        </nav>

        <nav aria-label="Bepul vositalar va kalkulyatorlar" className={styles.footerNav}>
          <h3>Kalkulyatorlar</h3>
          <Link href="/kalkulyator/uzum-komissiya">Uzum komissiya kalkulyatori</Link>
          <Link href="/kalkulyator/unit-iqtisodiyot">Unit iqtisodiyoti kalkulyatori</Link>
          <Link href="/kalkulyator/drr">DRR va reklama kalkulyatori</Link>
          <Link href="/lugat">Marketpleys lug&apos;ati</Link>
        </nav>

        <nav aria-label="Taqqoslash va muqobillar" className={styles.footerNav}>
          <h3>Muqobillar</h3>
          <Link href="/muqobil/zoomselling">ZoomSelling muqobili</Link>
          <Link href="/muqobil/1c">1C & MoySklad muqobili</Link>
          <Link href="/muqobil/huntersales">HunterSales muqobili</Link>
          <Link href="/muqobil/mpstats">MPStats muqobili</Link>
          <Link href="/muqobil/sellerfox">SellerFox muqobili</Link>
        </nav>

        <nav aria-label="Hisob va ma'lumotlar" className={styles.footerNav}>
          <h3>Ma&apos;lumot</h3>
          <Link href="/#imkoniyatlar">Imkoniyatlar</Link>
          <Link href="/#narxlar">Tariflar</Link>
          <Link href="/#savollar">Savollar</Link>
          <Link href="/terms">Foydalanish shartlari</Link>
          <Link href="/privacy">Maxfiylik siyosati</Link>
          <Link href="/login">Hisobga kirish</Link>
        </nav>
      </div>

      <div className={cn(base.container, styles.footerBottom)}>
        <span>© {new Date().getFullYear()} {siteConfig.name}.</span>
        <span>Marketpleys sotuvchilari uchun mustaqil analitika va boshqaruv platformasi.</span>
      </div>
    </footer>
  );
}
