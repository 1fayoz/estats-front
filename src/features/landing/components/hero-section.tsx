import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Box,
  Check,
  ChevronDown,
  CircleHelp,
  Layers3,
  Search,
  Settings2,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { NetworkIcon } from "@/components/brand/network-icons";
import base from "./landing.module.css";
import styles from "./landing-hero.module.css";

const BARS = [32, 46, 39, 59, 43, 52, 71, 58, 68, 86, 74, 96];

export type LandingLocale = "uz" | "ru" | "en";

const HERO_TEXTS = {
  uz: {
    kicker: "Marketpleys sotuvchilari uchun · Uzum, Yandex, WB, Ozon",
    titleStart: "Sotuvlar ko‘p.",
    titleHighlight: "Foyda",
    titleEnd: " qancha?",
    description:
      "Ombor, tan narx, bozor tahlili, SEO va ijtimoiy tarmoqlar — bitta ish maydonida. " +
      "Tushum ortidagi haqiqiy foydani ko‘ring va keyingi qadamingizni aniq belgilang.",
    ctaStart: "Bepul boshlash",
    ctaExplore: "Ichkarida nima bor?",
    reassurance: "Avval tanishing. Keyin do‘konlaringizni ulang.",
    topic1: "Ombor va FIFO",
    topic2: "SEO va AI",
    topic3: "Foyda tahlili",
    demoBadge: "Interfeys namunasi",
    demoShop: "Namuna do‘kon",
    demoTitle: "Biznesingiz raqamlarda",
    period: "30 kun",
    netProfit: "Sof foyda",
    currency: "so‘m",
    grossSales: "Yalpi savdo",
    totalExpenses: "Jami xarajat",
    chartHeading: "Sotuv dinamikasi",
    chartLegend: "Tushum",
    chartDate1: "1-sana",
    chartDate2: "15-sana",
    chartDate3: "30-sana",
    productLineTitle: "Har bir tovarning o‘z hisobi",
    productLineSub: "Tan narx · qoldiq · foyda",
    seoAudit: "SEO audit",
    seoTitle: "Kartochkada imkoniyat bor.",
    seoDesc: "Kalit so‘zlar va aniq tavsiyalar",
    figcaption: "Namuna raqamlar. Haqiqiy hisobot do‘koningiz ma’lumotlari asosida.",
  },
  ru: {
    kicker: "Для селлеров маркетплейсов · Uzum, Yandex, WB, Ozon",
    titleStart: "Продаж много.",
    titleHighlight: "Прибыль",
    titleEnd: " какая?",
    description:
      "Склад, себестоимость, аналитика рынка, SEO и соцсети — в одном окне. " +
      "Узнайте реальную чистую прибыль за оборотом и управляйте ростом бизнеса без рутины.",
    ctaStart: "Начать бесплатно",
    ctaExplore: "Что внутри?",
    reassurance: "Сначала протестируйте. Затем подключите магазины.",
    topic1: "Склад и FIFO",
    topic2: "SEO и AI",
    topic3: "Анализ прибыли",
    demoBadge: "Пример интерфейса",
    demoShop: "Демо-магазин",
    demoTitle: "Ваш бизнес в цифрах",
    period: "30 дней",
    netProfit: "Чистая прибыль",
    currency: "сум",
    grossSales: "Выручка",
    totalExpenses: "Все расходы",
    chartHeading: "Динамика продаж",
    chartLegend: "Выручка",
    chartDate1: "1-е число",
    chartDate2: "15-е число",
    chartDate3: "30-е число",
    productLineTitle: "Учет по каждому артикулу",
    productLineSub: "Себестоимость · остатки · прибыль",
    seoAudit: "SEO аудит",
    seoTitle: "Карточка имеет потенциал роста.",
    seoDesc: "Ключевые слова и рекомендации",
    figcaption: "Демонстрационные данные. Реальный отчет строится на данных вашего магазина.",
  },
  en: {
    kicker: "For Marketplace Sellers · Uzum, Yandex, WB, Ozon",
    titleStart: "High sales volume.",
    titleHighlight: "Profit",
    titleEnd: " is what?",
    description:
      "Warehouse, FIFO costing, market analytics, SEO, and social channels — in one platform. " +
      "Uncover real net profit behind gross revenue and make confident scaling decisions.",
    ctaStart: "Start for Free",
    ctaExplore: "Explore Features",
    reassurance: "Explore first. Connect your stores anytime.",
    topic1: "Warehouse & FIFO",
    topic2: "SEO & AI",
    topic3: "Profit Analytics",
    demoBadge: "Interface Preview",
    demoShop: "Demo Store",
    demoTitle: "Your Business in Numbers",
    period: "30 days",
    netProfit: "Net Profit",
    currency: "UZS",
    grossSales: "Gross Sales",
    totalExpenses: "Total Costs",
    chartHeading: "Sales Velocity",
    chartLegend: "Revenue",
    chartDate1: "Day 1",
    chartDate2: "Day 15",
    chartDate3: "Day 30",
    productLineTitle: "Itemized SKU Accounting",
    productLineSub: "COGS · stock · margins",
    seoAudit: "SEO Audit",
    seoTitle: "Listing has growth potential.",
    seoDesc: "Target keywords and actionable fixes",
    figcaption: "Sample figures. Live reports are powered by your store data.",
  },
};

export function HeroSection({ locale = "uz" }: { locale?: LandingLocale }) {
  const t = HERO_TEXTS[locale] || HERO_TEXTS.uz;

  return (
    <section className={styles.hero} aria-labelledby="landing-title">
      <div className={`${base.container} ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span /> {t.kicker}
          </p>
          <h1 id="landing-title">
            {t.titleStart}
            <br />
            <span>{t.titleHighlight}</span>
            {t.titleEnd}
          </h1>
          <p className={styles.description}>{t.description}</p>
          <div className={styles.actions}>
            <Link href="/login" className={base.primaryButton}>
              {t.ctaStart} <ArrowRight />
            </Link>
            <a href="#imkoniyatlar" className={base.secondaryButton}>
              {t.ctaExplore} <ArrowDown />
            </a>
          </div>
          <p className={styles.reassurance}>
            <Check /> {t.reassurance}
          </p>
          <div className={styles.heroTopics}>
            <span>
              <Layers3 /> {t.topic1}
            </span>
            <span>
              <Sparkles /> {t.topic2}
            </span>
            <span>
              <BarChart3 /> {t.topic3}
            </span>
          </div>
        </div>

        <figure
          className={styles.visual}
          aria-label="eStats ish maydonining namuna ma’lumotlar bilan soddalashtirilgan ko‘rinishi"
        >
          <div className={styles.visualGrid} aria-hidden="true" />
          <div className={styles.window}>
            <div className={styles.windowBar}>
              <span className={styles.windowBrand}>
                <LogoMark size={21} />
                <strong>eStats</strong>
              </span>
              <span className={styles.demoBadge}>{t.demoBadge}</span>
              <span className={styles.windowAvatar}>N</span>
            </div>
            <div className={styles.application}>
              <div className={styles.rail} aria-hidden="true">
                <span>
                  <BarChart3 />
                </span>
                <Box />
                <Search />
                <Wallet />
                <Settings2 />
                <CircleHelp className={styles.railBottom} />
              </div>
              <div className={styles.dashboard}>
                <div className={styles.dashboardHeader}>
                  <div>
                    <p>{t.demoShop}</p>
                    <h2>{t.demoTitle}</h2>
                  </div>
                  <span className={styles.period}>
                    {t.period} <ChevronDown />
                  </span>
                </div>
                <div className={styles.balance}>
                  <span className={styles.balanceIcon}>
                    <Wallet />
                  </span>
                  <div>
                    <p>{t.netProfit}</p>
                    <strong>
                      18 420 000 <span>{t.currency}</span>
                    </strong>
                  </div>
                  <span className={styles.balanceCheck}>
                    <Check />
                  </span>
                </div>
                <div className={styles.smallMetrics}>
                  <div>
                    <span>{t.grossSales}</span>
                    <strong>
                      46 800 000 <small>{t.currency}</small>
                    </strong>
                  </div>
                  <div>
                    <span>{t.totalExpenses}</span>
                    <strong>
                      28 380 000 <small>{t.currency}</small>
                    </strong>
                  </div>
                </div>
                <div className={styles.chart}>
                  <div className={styles.chartHeading}>
                    <strong>{t.chartHeading}</strong>
                    <span>
                      <i /> {t.chartLegend}
                    </span>
                  </div>
                  <div className={styles.plot} aria-hidden="true">
                    <div className={styles.plotGrid}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.bars}>
                      {BARS.map((height, index) => (
                        <span key={index} style={{ height: `${height}%` }}>
                          <i />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.chartDates}>
                    <span>{t.chartDate1}</span>
                    <span>{t.chartDate2}</span>
                    <span>{t.chartDate3}</span>
                  </div>
                </div>
                <div className={styles.productLine}>
                  <span>
                    <Box />
                  </span>
                  <div>
                    <strong>{t.productLineTitle}</strong>
                    <p>{t.productLineSub}</p>
                  </div>
                  <ArrowRight />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.seoNote}>
            <div className={styles.score}>
              <span>
                81<small>/100</small>
              </span>
            </div>
            <div>
              <p>
                <Sparkles /> {t.seoAudit}
              </p>
              <strong>{t.seoTitle}</strong>
              <span>{t.seoDesc}</span>
            </div>
          </div>
          <figcaption>{t.figcaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}

const CONNECTIONS_TEXTS = {
  uz: {
    titleStart: "Marketpleyslar va tarmoqlar.",
    titleBold: "Barchasi bir-biriga bog‘langan.",
  },
  ru: {
    titleStart: "Маркетплейсы и соцсети.",
    titleBold: "Все объединены в единую систему.",
  },
  en: {
    titleStart: "Marketplaces and channels.",
    titleBold: "Everything seamlessly connected.",
  },
};

export function LandingConnections({ locale = "uz" }: { locale?: LandingLocale }) {
  const t = CONNECTIONS_TEXTS[locale] || CONNECTIONS_TEXTS.uz;

  return (
    <section className={styles.connections} aria-label="Integratsiyalar">
      <div className={`${base.container} ${styles.connectionsInner}`}>
        <p>
          {t.titleStart}
          <br />
          <strong>{t.titleBold}</strong>
        </p>
        <div className={styles.connectionNames}>
          <span className={styles.market}>
            <Store />
            <strong>Uzum Market</strong>
          </span>
          <span style={{ color: "#fc3f1d" }}>
            <Store />
            <strong>Yandex Market</strong>
          </span>
          <span style={{ color: "#cb11ab" }}>
            <Store />
            <strong>Wildberries</strong>
          </span>
          <span style={{ color: "#005bff" }}>
            <Store />
            <strong>Ozon</strong>
          </span>
          <span>
            <NetworkIcon platform="telegram" />
            <strong>Telegram</strong>
          </span>
          <span>
            <NetworkIcon platform="instagram" />
            <strong>Instagram</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
