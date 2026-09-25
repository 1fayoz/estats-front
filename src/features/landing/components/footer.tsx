import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "@/components/seo/language-switcher";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

export function LandingFooter({ locale = "uz" }: { locale?: "uz" | "ru" | "en" }) {
  const homeHref = locale === "uz" ? "/" : `/${locale}`;

  if (locale === "ru") {
    return (
      <footer className={styles.footer}>
        <div className={cn(base.container, styles.footerGrid)}>
          <div className={styles.footerIntro}>
            <Link href={homeHref} className={styles.logo} aria-label="eStats — главная страница">
              <LogoMark size={34} />
              <span>{siteConfig.name}</span>
            </Link>
            <p>Единая экосистема для селлеров маркетплейсов: Uzum Market, Wildberries, Яндекс Маркет и Ozon.</p>
            <a href={siteConfig.botUrl} target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
              Открыть Telegram бот<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (в новой вкладке)</span>
            </a>
          </div>

          <nav aria-label="Решения и инструменты" className={styles.footerNav}>
            <h3>Решения</h3>
            <Link href="/ru/yechimlar/ombor">Учет склада и FBO/FBS</Link>
            <Link href="/ru/yechimlar/moliya">Финансы и FIFO себестоимость</Link>
            <Link href="/ru/yechimlar/tovar-seo">AI SEO карточек товаров</Link>
            <Link href="/yechimlar/bozor">Аналитика ниш и рынка</Link>
            <Link href="/yechimlar/marketing">Маркетинг и ДРР рекламы</Link>
            <Link href="/yechimlar/multi-market">Мульти-маркет управление</Link>
            <Link href="/yechimlar/uzum-lens">Расширение eStats Lens</Link>
          </nav>

          <nav aria-label="Бесплатные калькуляторы" className={styles.footerNav}>
            <h3>Калькуляторы</h3>
            <Link href="/ru/kalkulyator/shtrix-kod">Генератор штрихкодов 58х40</Link>
            <Link href="/ru/kalkulyator/fbo-akt">Акт приёма FBO (Накладная)</Link>
            <Link href="/ru/tekshirish">Сканер товаров Uzum</Link>
            <Link href="/ru/kalkulyator/uzum-komissiya">Калькулятор комиссии Uzum</Link>
            <Link href="/ru/kalkulyator/unit-iqtisodiyot">Калькулятор юнит-экономики</Link>
            <Link href="/ru/kalkulyator/vozvrat-zarari">Калькулятор возвратов</Link>
            <Link href="/ru/kalkulyator/ombor-zaxirasi">Расчет остатков (ROP)</Link>
            <Link href="/ru/kalkulyator/chegirma-narx">Расчет скидок и наценки</Link>
            <Link href="/ru/kalkulyator/drr">Калькулятор ДРР и ROAS</Link>
          </nav>

          <nav aria-label="Маркетплейсы" className={styles.footerNav}>
            <h3>Маркетплейсы</h3>
            <Link href="/ru/bozorlar/wildberries">Wildberries Узбекистан</Link>
            <Link href="/ru/bozorlar/yandex-market">Яндекс Маркет Узбекистан</Link>
            <Link href="/ru/bozorlar/ozon">Ozon Узбекистан</Link>
            <Link href="/ru/kategoriya/elektronika">Ниша Электроника</Link>
            <Link href="/ru/kategoriya/kiyim-va-poyabzal">Ниша Одежда и обувь</Link>
            <Link href="/ru/qollanma">База знаний и инструкции</Link>
            <Link href="/ru/lugat">Глоссарий терминов</Link>
          </nav>

          <nav aria-label="Альтернативы и кабинет" className={styles.footerNav}>
            <h3>Альтернативы</h3>
            <Link href="/ru/muqobil/zoomselling">Аналог ZoomSelling</Link>
            <Link href="/ru/muqobil/1c">Вместо 1С и МойСклад</Link>
            <Link href="/ru/muqobil/mpstats">Аналог MPSTATS</Link>
            <Link href="/ru/muqobil/huntersales">Аналог HunterSales</Link>
            <Link href="/ru/muqobil/sellerfox">Аналог SellerFox</Link>
            <Link href="/login">Вход в кабинет</Link>
          </nav>
        </div>

        <div className={cn(base.container, styles.footerBottom, "flex flex-col sm:flex-row items-center justify-between gap-4")}>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {siteConfig.name}.</span>
            <span>Независимая платформа аналитики и управления для селлеров маркетплейсов.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Язык:</span>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    );
  }

  if (locale === "en") {
    return (
      <footer className={styles.footer}>
        <div className={cn(base.container, styles.footerGrid)}>
          <div className={styles.footerIntro}>
            <Link href={homeHref} className={styles.logo} aria-label="eStats — home">
              <LogoMark size={34} />
              <span>{siteConfig.name}</span>
            </Link>
            <p>All-in-one ecommerce operating system for marketplace sellers: Uzum Market, Wildberries, Yandex Market, and Ozon.</p>
            <a href={siteConfig.botUrl} target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
              Launch Telegram Bot<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens new window)</span>
            </a>
          </div>

          <nav aria-label="Solutions" className={styles.footerNav}>
            <h3>Solutions</h3>
            <Link href="/en/solutions/marketplace-analytics">Marketplace Analytics</Link>
            <Link href="/en/solutions/inventory-management">Cloud Inventory &amp; WMS</Link>
            <Link href="/en/solutions/ai-seo">AI Listing Optimization</Link>
            <Link href="/en/alternatives/zoomselling">ZoomSelling Alternative</Link>
            <Link href="/yechimlar/multi-market">Multi-Channel Sync</Link>
          </nav>

          <nav aria-label="Free Tools" className={styles.footerNav}>
            <h3>Free Tools</h3>
            <Link href="/en/tools/barcode-generator">Barcode &amp; Thermal Labels</Link>
            <Link href="/en/tools/product-checker">Uzum Product Scanner</Link>
            <Link href="/en/tools/commission-calculator">Uzum Commission Calculator</Link>
            <Link href="/kalkulyator/unit-iqtisodiyot">Unit Economics Tool</Link>
            <Link href="/kalkulyator/drr">Advertising ROAS / ACoS</Link>
          </nav>

          <nav aria-label="Marketplaces" className={styles.footerNav}>
            <h3>Marketplaces</h3>
            <Link href="/bozorlar/wildberries">Wildberries Uzbekistan</Link>
            <Link href="/bozorlar/yandex-market">Yandex Market Uzbekistan</Link>
            <Link href="/bozorlar/ozon">Ozon Uzbekistan</Link>
            <Link href="/qollanma">Knowledge Base</Link>
          </nav>

          <nav aria-label="Company" className={styles.footerNav}>
            <h3>Account</h3>
            <Link href="/login">Seller Portal Login</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </nav>
        </div>

        <div className={cn(base.container, styles.footerBottom, "flex flex-col sm:flex-row items-center justify-between gap-4")}>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {siteConfig.name}.</span>
            <span>Independent multi-marketplace analytics and operations platform.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Language:</span>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    );
  }

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
          <Link href="/kalkulyator/shtrix-kod">Shtrix-kod &amp; Termo-etiketka</Link>
          <Link href="/kalkulyator/fbo-akt">FBO Tovar topshirish akti</Link>
          <Link href="/tekshirish">Uzum tovar skaneri</Link>
          <Link href="/kalkulyator/uzum-komissiya">Uzum komissiya kalkulyatori</Link>
          <Link href="/kalkulyator/unit-iqtisodiyot">Unit iqtisodiyoti kalkulyatori</Link>
          <Link href="/kalkulyator/vozvrat-zarari">Vozvrat va zarar kalkulyatori</Link>
          <Link href="/kalkulyator/chegirma-narx">Chegirma va narx kalkulyatori</Link>
          <Link href="/kalkulyator/ombor-zaxirasi">Ombor zaxirasi (ROP)</Link>
          <Link href="/kalkulyator/drr">DRR va reklama kalkulyatori</Link>
        </nav>

        <nav aria-label="Toifalar va Qo'llanmalar" className={styles.footerNav}>
          <h3>Toifalar &amp; Qo&apos;llanma</h3>
          <Link href="/kategoriya/elektronika">Elektronika tahlili</Link>
          <Link href="/kategoriya/kiyim-va-poyabzal">Kiyim va poyabzal</Link>
          <Link href="/kategoriya/gozallik-va-parvarish">Go&apos;zallik va parvarish</Link>
          <Link href="/qollanma">Barcha qo&apos;llanmalar</Link>
          <Link href="/qollanma/uzumda-dokon-ochish">Uzumda do&apos;kon ochish</Link>
          <Link href="/qollanma/kartochka-toldirish">Tovar kartochkasi SEO</Link>
          <Link href="/lugat">Marketpleys lug&apos;ati</Link>
        </nav>

        <nav aria-label="Taqqoslash va hisob" className={styles.footerNav}>
          <h3>Bozorlar &amp; Muqobil</h3>
          <Link href="/bozorlar/wildberries">Wildberries O&apos;zbekiston</Link>
          <Link href="/bozorlar/yandex-market">Yandex Market O&apos;zbekiston</Link>
          <Link href="/bozorlar/ozon">Ozon O&apos;zbekiston</Link>
          <Link href="/muqobil/zoomselling">ZoomSelling muqobili</Link>
          <Link href="/muqobil/1c">1C &amp; MoySklad muqobili</Link>
          <Link href="/muqobil/mpstats">MPStats muqobili</Link>
          <Link href="/muqobil/huntersales">HunterSales muqobili</Link>
          <Link href="/muqobil/sellerfox">SellerFox muqobili</Link>
          <Link href="/login">Hisobga kirish</Link>
        </nav>
      </div>

      <div className={cn(base.container, styles.footerBottom, "flex flex-col sm:flex-row items-center justify-between gap-4")}>
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span>© {new Date().getFullYear()} {siteConfig.name}.</span>
          <span>Marketpleys sotuvchilari uchun mustaqil analitika va boshqaruv platformasi.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Til:</span>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
