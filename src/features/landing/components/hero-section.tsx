import Link from "next/link";
import { ArrowDown, ArrowRight, BarChart3, Box, Check, ChevronDown, CircleHelp, Layers3, Search, Settings2, Sparkles, Store, Wallet } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { NetworkIcon } from "@/components/brand/network-icons";
import base from "./landing.module.css";
import styles from "./landing-hero.module.css";

const BARS = [32, 46, 39, 59, 43, 52, 71, 58, 68, 86, 74, 96];

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="landing-title">
      <div className={`${base.container} ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}><span /> Uzum Market sotuvchilari uchun</p>
          <h1 id="landing-title">Sotuvlar ko‘p.<br /><span>Foyda</span> qancha?</h1>
          <p className={styles.description}>
            Ombor, tan narx, SEO va ijtimoiy tarmoqlar — bitta ish maydonida.
            Tushum ortidagi haqiqiy foydani ko‘ring va keyingi qadamingizni aniq belgilang.
          </p>
          <div className={styles.actions}>
            <Link href="/login" className={base.primaryButton}>Bepul boshlash <ArrowRight /></Link>
            <a href="#imkoniyatlar" className={base.secondaryButton}>Ichkarida nima bor? <ArrowDown /></a>
          </div>
          <p className={styles.reassurance}><Check /> Avval tanishing. Keyin do‘koningizni ulang.</p>
          <div className={styles.heroTopics}>
            <span><Layers3 /> Ombor va FIFO</span>
            <span><Sparkles /> SEO va AI</span>
            <span><BarChart3 /> Foyda tahlili</span>
          </div>
        </div>

        <figure className={styles.visual} aria-label="eStats ish maydonining namuna ma’lumotlar bilan soddalashtirilgan ko‘rinishi">
          <div className={styles.visualGrid} aria-hidden="true" />
          <div className={styles.window}>
            <div className={styles.windowBar}>
              <span className={styles.windowBrand}><LogoMark size={21} /><strong>eStats</strong></span>
              <span className={styles.demoBadge}>Interfeys namunasi</span>
              <span className={styles.windowAvatar}>N</span>
            </div>
            <div className={styles.application}>
              <div className={styles.rail} aria-hidden="true">
                <span><BarChart3 /></span><Box /><Search /><Wallet /><Settings2 />
                <CircleHelp className={styles.railBottom} />
              </div>
              <div className={styles.dashboard}>
                <div className={styles.dashboardHeader}>
                  <div><p>Namuna do‘kon</p><h2>Biznesingiz raqamlarda</h2></div>
                  <span className={styles.period}>30 kun <ChevronDown /></span>
                </div>
                <div className={styles.balance}>
                  <span className={styles.balanceIcon}><Wallet /></span>
                  <div><p>Sof foyda</p><strong>18 420 000 <span>so‘m</span></strong></div>
                  <span className={styles.balanceCheck}><Check /></span>
                </div>
                <div className={styles.smallMetrics}>
                  <div><span>Yalpi savdo</span><strong>46 800 000 <small>so‘m</small></strong></div>
                  <div><span>Jami xarajat</span><strong>28 380 000 <small>so‘m</small></strong></div>
                </div>
                <div className={styles.chart}>
                  <div className={styles.chartHeading}><strong>Sotuv dinamikasi</strong><span><i /> Tushum</span></div>
                  <div className={styles.plot} aria-hidden="true">
                    <div className={styles.plotGrid}><span /><span /><span /></div>
                    <div className={styles.bars}>{BARS.map((height, index) => <span key={index} style={{ height: `${height}%` }}><i /></span>)}</div>
                  </div>
                  <div className={styles.chartDates}><span>1-sana</span><span>15-sana</span><span>30-sana</span></div>
                </div>
                <div className={styles.productLine}><span><Box /></span><div><strong>Har bir tovarning o‘z hisobi</strong><p>Tan narx · qoldiq · foyda</p></div><ArrowRight /></div>
              </div>
            </div>
          </div>
          <div className={styles.seoNote}>
            <div className={styles.score}><span>81<small>/100</small></span></div>
            <div><p><Sparkles /> SEO audit</p><strong>Kartochkada imkoniyat bor.</strong><span>Kalit so‘zlar va aniq tavsiyalar</span></div>
          </div>
          <figcaption>Namuna raqamlar. Haqiqiy hisobot do‘koningiz ma’lumotlari asosida.</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function LandingConnections() {
  return (
    <section className={styles.connections} aria-label="Integratsiyalar">
      <div className={`${base.container} ${styles.connectionsInner}`}>
        <p>Siz ishlatadigan vositalar.<br /><strong>Endi bir-biriga bog‘langan.</strong></p>
        <div className={styles.connectionNames}>
          <span className={styles.market}><Store /><strong>Uzum Market</strong></span>
          <span><NetworkIcon platform="instagram" /><strong>Instagram</strong></span>
          <span><NetworkIcon platform="telegram" /><strong>Telegram</strong></span>
          <span><NetworkIcon platform="tiktok" /><strong>TikTok</strong></span>
          <span><NetworkIcon platform="linkedin" /><strong>LinkedIn</strong></span>
        </div>
      </div>
    </section>
  );
}
