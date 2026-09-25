"use client";

import * as React from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, Boxes, ChartNoAxesCombined, Check, Globe2, Package, Search, Sparkles } from "lucide-react";

import base from "./landing.module.css";
import styles from "./landing-features.module.css";

export type FeatureLocale = "uz" | "ru" | "en";
type FeatureId = "seo" | "finance" | "warehouse" | "socials";

type Feature = {
  id: FeatureId;
  label: string;
  icon: typeof Search;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  screenshot?: { desktop: string; mobile: string; alt: string; path: string };
};

const FEATURES_BY_LOCALE: Record<FeatureLocale, Feature[]> = {
  uz: [
    {
      id: "seo",
      label: "SEO & AI",
      icon: Sparkles,
      eyebrow: "Kartochka ustida aniq ish",
      title: "Nimani yaxshilash kerakligini ko'ring.",
      description: "Tovar nomi, tavsifi va kalit so'zlarini tekshiring. AI tavsiyalaridan keraklisini tanlab, kartochkangizni tayyorlang.",
      points: [
        "O'zbekcha va ruscha matn uchun alohida tahlil",
        "Kalit so'zlar, qidiruvdagi o'rin va audit tarixi",
        "AI matni — tekshirishingiz uchun qoralama",
      ],
      screenshot: { desktop: "/shots/seo-audit.jpg", mobile: "/shots/m/seo-audit.png", alt: "eStats SEO auditi: kartochka bali, tillar bo'yicha tahlil va kalit so'zlar", path: "estats.uz/seo" },
    },
    {
      id: "finance",
      label: "Foyda va moliya",
      icon: ChartNoAxesCombined,
      eyebrow: "Tushumdan foydagacha",
      title: "Savdo ortidagi hisobni tushuning.",
      description: "Tushum, tan narx, komissiya va xarajatlarni birga ko'ring. Qaysi tovar qancha foyda keltirayotganini solishtiring.",
      points: [
        "Kirim partiyalari bo'yicha FIFO tan narxi",
        "Komissiya, logistika va boshqa xarajatlar",
        "Tan narxi kiritilmagan sotuvlar alohida ko'rinadi",
      ],
      screenshot: { desktop: "/shots/pnl.jpg", mobile: "/shots/m/pnl.png", alt: "eStats foyda va zarar hisoboti: tushum, tan narx, komissiya va foyda", path: "estats.uz/pnl" },
    },
    {
      id: "warehouse",
      label: "Ombor",
      icon: Boxes,
      eyebrow: "Har bir partiya hisobda",
      title: "Qoldiq va kirimlar doim ko'z oldingizda.",
      description: "Tovarlarni toping, yangi kelgan partiyani kiriting va uning tan narxini saqlang. Keyingi qaror uchun tartibli hisob.",
      points: [
        "Tovar, SKU va qoldiq bo'yicha tez qidiruv",
        "Har bir kirim uchun miqdor, narx va sana",
        "Tovar sahifasida sotuv va qaytarishlar tarixi",
      ],
    },
    {
      id: "socials",
      label: "Tarmoqlar",
      icon: Globe2,
      eyebrow: "Tovardan tayyor postgacha",
      title: "Kontentni ham bir joydan boshqaring.",
      description: "Tovarlaringizni postlar bilan bog'lang. Rasm va matnni tekshirib, ulangan akkauntlaringizga e'lon yuboring.",
      points: [
        "Qaysi tovar qayerda joylanganini ko'rish",
        "Joylashdan oldin matn va rasmlarni tekshirish",
        "E'lon holati va mavjud tarmoq statistikasi",
      ],
      screenshot: { desktop: "/shots/socials.jpg", mobile: "/shots/m/socials.png", alt: "eStats ijtimoiy tarmoqlar kabineti: tovarlar, postlar va ulangan akkauntlar", path: "estats.uz/socials" },
    },
  ],
  ru: [
    {
      id: "seo",
      label: "SEO & AI",
      icon: Sparkles,
      eyebrow: "Точечная оптимизация карточки",
      title: "Видно, что именно нужно улучшить.",
      description: "Проверьте название, поисковые фразы и описание. Используйте рекомендации AI для вывода товара на первые места в поиске.",
      points: [
        "Раздельный анализ для узбекского и русского языков",
        "Ядро поисковых запросов, позиции в выдаче и аудит",
        "AI тексты — готовый черновик для публикации",
      ],
      screenshot: { desktop: "/shots/seo-audit.jpg", mobile: "/shots/m/seo-audit.png", alt: "eStats SEO аудит карточки: баллы, ключевые слова", path: "estats.uz/ru/seo" },
    },
    {
      id: "finance",
      label: "Прибыль и PnL",
      icon: ChartNoAxesCombined,
      eyebrow: "От выручки к чистой прибыли",
      title: "Точная экономика каждого артикула.",
      description: "Смотрите выручку, себестоимость закупки, комиссии и возвраты в едином окне. Сравнивайте реальную маржинальность товаров.",
      points: [
        "Партионный учет себестоимости по стандарту FIFO",
        "Учет логистики FBO, комиссий площадок и налогов",
        "Товары без указанной себестоимости видны сразу",
      ],
      screenshot: { desktop: "/shots/pnl.jpg", mobile: "/shots/m/pnl.png", alt: "eStats отчет PnL: выручка, себестоимость, комиссии и чистая прибыль", path: "estats.uz/ru/pnl" },
    },
    {
      id: "warehouse",
      label: "Склад",
      icon: Boxes,
      eyebrow: "Каждая партия под контролем",
      title: "Остатки FBO/FBS всегда перед глазами.",
      description: "Управляйте приходами, фиксируйте закупочную цену каждой поставки и получайте уведомления до того, как товар закончится.",
      points: [
        "Быстрый поиск по названию, артикулу и SKU",
        "Количество, закупочная цена и дата каждой партии",
        "История продаж, возвратов и выкупов в карточке",
      ],
    },
    {
      id: "socials",
      label: "Соцсети",
      icon: Globe2,
      eyebrow: "От товара до публикации",
      title: "Управляйте маркетингом из одного окна.",
      description: "Связывайте товары с постами в Telegram и Instagram. Проверяйте фото и описания перед мгновенной публикацией на каналы.",
      points: [
        "Контроль публикаций товаров по социальным сетям",
        "Редактирование продающих описаний перед постом",
        "Статусы выгрузок и динамика охватов",
      ],
      screenshot: { desktop: "/shots/socials.jpg", mobile: "/shots/m/socials.png", alt: "eStats социальные сети: автопостинг в Telegram и Instagram", path: "estats.uz/ru/socials" },
    },
  ],
  en: [
    {
      id: "seo",
      label: "SEO & AI",
      icon: Sparkles,
      eyebrow: "Listing Optimization",
      title: "Identify exactly what needs improvement.",
      description: "Inspect title formulas, attribute indexing, and keyword density. Apply AI recommendations to boost organic search rank.",
      points: [
        "Separate bilingual audit for Uzbek and Russian text",
        "Search volume indexing, rank tracking, and audit history",
        "AI listing generation — structured drafts ready to publish",
      ],
      screenshot: { desktop: "/shots/seo-audit.jpg", mobile: "/shots/m/seo-audit.png", alt: "eStats SEO audit: listing score, bilingual analysis, keywords", path: "estats.uz/en/seo" },
    },
    {
      id: "finance",
      label: "PnL & Profit",
      icon: ChartNoAxesCombined,
      eyebrow: "From Gross to Net",
      title: "Understand unit profitability behind sales volume.",
      description: "Track gross merchandise value, COGS, referral commissions, and return logistics in one clean financial ledger.",
      points: [
        "Batch-level purchase FIFO inventory costing",
        "Commission tiers, fulfillment fees, and operating overhead",
        "Uncosted SKUs flagged instantly to prevent skewed metrics",
      ],
      screenshot: { desktop: "/shots/pnl.jpg", mobile: "/shots/m/pnl.png", alt: "eStats PnL report: revenue, COGS, fees, net profit", path: "estats.uz/en/pnl" },
    },
    {
      id: "warehouse",
      label: "Warehouse",
      icon: Boxes,
      eyebrow: "Batch-Level Control",
      title: "Real-time FBO/FBS stock levels at your fingertips.",
      description: "Log supplier delivery batches, record varying unit costs, and receive automatic safety stock depletion alerts.",
      points: [
        "Instant filtering by product title, SKU, and warehouse",
        "Quantity, unit price, and timestamp for each arrival",
        "Full sales velocity and customer return history per SKU",
      ],
    },
    {
      id: "socials",
      label: "Channels",
      icon: Globe2,
      eyebrow: "Catalog to Social Feeds",
      title: "Broadcast marketing content directly from inventory.",
      description: "Connect catalog products to Telegram channels and Instagram feeds. Preview imagery and captions before instant broadcasting.",
      points: [
        "Visibility into published and pending promotional posts",
        "Pre-publish preview for images, prices, and marketing hooks",
        "Broadcast logs and channel engagement monitoring",
      ],
      screenshot: { desktop: "/shots/socials.jpg", mobile: "/shots/m/socials.png", alt: "eStats social broadcasting: Telegram and Instagram auto-posts", path: "estats.uz/en/socials" },
    },
  ],
};

const SECTION_HEADERS = {
  uz: {
    eyebrow: "Imkoniyatlar",
    titleStart: "Har bir vazifaga",
    titleBreak: "o'z ish quroli.",
    lead: "Tovarni topishdan foydani hisoblashgacha. Kerakli bo'limni tanlang va eStats qanday yordam berishini ko'ring.",
    cta: "Kabinetga o'tish",
  },
  ru: {
    eyebrow: "Возможности",
    titleStart: "Для каждой задачи —",
    titleBreak: "свой рабочий инструмент.",
    lead: "От поиска прибыльного товара до точного расчета PnL. Выберите нужный раздел и посмотрите, как работает eStats.",
    cta: "Перейти в кабинет",
  },
  en: {
    eyebrow: "Capabilities",
    titleStart: "The right tool",
    titleBreak: "for every daily task.",
    lead: "From product discovery to real-time net margin tracking. Explore each module and see how eStats drives operational clarity.",
    cta: "Open Dashboard",
  },
};

export function QuestionsSection({ locale = "uz" }: { locale?: FeatureLocale }) {
  const [active, setActive] = React.useState<FeatureId>("seo");
  const featureList = FEATURES_BY_LOCALE[locale] || FEATURES_BY_LOCALE.uz;
  const header = SECTION_HEADERS[locale] || SECTION_HEADERS.uz;
  const selected = featureList.find((feature) => feature.id === active) ?? featureList[0];

  return (
    <section id="imkoniyatlar" className={styles.features} aria-labelledby="features-title">
      <div className={base.container}>
        <div className={styles.sectionIntro}>
          <div>
            <p className={base.eyebrow}>{header.eyebrow}</p>
            <h2 id="features-title" className={base.sectionTitle}>
              {header.titleStart}
              <br />
              {header.titleBreak}
            </h2>
          </div>
          <p className={base.lead}>{header.lead}</p>
        </div>

        <Tabs.Root value={active} onValueChange={(value) => setActive(value as FeatureId)} className={styles.tabs}>
          <Tabs.List aria-label="eStats imkoniyatlari" className={styles.tabList}>
            {featureList.map((feature) => {
              const Icon = feature.icon;
              return (
                <Tabs.Trigger key={feature.id} value={feature.id} className={styles.tab}>
                  <Icon aria-hidden="true" />
                  <span>{feature.label}</span>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          <Tabs.Content key={selected.id} value={selected.id} className={styles.featurePanel}>
            <div className={styles.featureCopy}>
              <p className={styles.featureEyebrow}>{selected.eyebrow}</p>
              <h3>{selected.title}</h3>
              <p className={styles.featureDescription}>{selected.description}</p>
              <ul className={styles.featurePoints}>
                {selected.points.map((point) => (
                  <li key={point}>
                    <span>
                      <Check aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={base.textLink}>
                {header.cta} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.preview}>
              {selected.screenshot ? (
                <ScreenshotPreview key={selected.id} screenshot={selected.screenshot} locale={locale} />
              ) : (
                <WarehousePreview locale={locale} />
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
}

function ScreenshotPreview({
  screenshot,
  locale = "uz",
}: {
  screenshot: NonNullable<Feature["screenshot"]>;
  locale?: FeatureLocale;
}) {
  const caption =
    locale === "ru"
      ? "Демонстрационный скриншот кабинета. Данные приведены для примера."
      : locale === "en"
      ? "Sample product interface screenshot. Figures are illustrative."
      : "Mahsulot ekranidan namuna · ekranning bir qismi. Raqamlar misol uchun.";

  return (
    <figure className={styles.screenshot}>
      <div className={styles.browserBar} aria-hidden="true">
        <span className={styles.browserDots}>
          <i />
          <i />
          <i />
        </span>
        <span>{screenshot.path}</span>
        <span className={styles.browserLabel}>eStats</span>
      </div>
      <div className={styles.screenshotWindow}>
        <picture>
          <source media="(max-width: 767px)" srcSet={screenshot.mobile} />
          <img src={screenshot.desktop} alt={screenshot.alt} width={1456} height={829} loading="lazy" decoding="async" />
        </picture>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

const SAMPLE_PRODUCTS_BY_LOCALE = {
  uz: [
    { name: "Termos, 450 ml", sku: "TRM-450", stock: "48 dona", cost: "30 000 so'm", empty: false },
    { name: "Stol chirog'i", sku: "LMP-012", stock: "12 dona", cost: "55 000 so'm", empty: false },
    { name: "Ryukzak, 20 l", sku: "BAG-020", stock: "0 dona", cost: "85 000 so'm", empty: true },
  ],
  ru: [
    { name: "Термос, 450 мл", sku: "TRM-450", stock: "48 шт.", cost: "30 000 сум", empty: false },
    { name: "Настольная лампа", sku: "LMP-012", stock: "12 шт.", cost: "55 000 сум", empty: false },
    { name: "Рюкзак городской", sku: "BAG-020", stock: "0 шт.", cost: "85 000 сум", empty: true },
  ],
  en: [
    { name: "Thermos Flask, 450ml", sku: "TRM-450", stock: "48 units", cost: "30,000 UZS", empty: false },
    { name: "Desk LED Lamp", sku: "LMP-012", stock: "12 units", cost: "55,000 UZS", empty: false },
    { name: "Travel Backpack", sku: "BAG-020", stock: "0 units", cost: "85,000 UZS", empty: true },
  ],
};

function WarehousePreview({ locale = "uz" }: { locale?: FeatureLocale }) {
  const items = SAMPLE_PRODUCTS_BY_LOCALE[locale] || SAMPLE_PRODUCTS_BY_LOCALE.uz;
  const labels = {
    uz: { title: "Ombor", badge: "Namuna", skus: "Tovarlar", units: "Jami qoldiq", search: "Tovar yoki SKU...", col1: "Tovar", col2: "Qoldiq / tan narxi" },
    ru: { title: "Склад", badge: "Пример", skus: "Товаров", units: "Всего остаток", search: "Товар или SKU...", col1: "Артикул", col2: "Остаток / себестоимость" },
    en: { title: "Warehouse", badge: "Demo", skus: "Products", units: "Total Stock", search: "Product or SKU...", col1: "Item", col2: "Stock / Unit Cost" },
  }[locale] || { title: "Ombor", badge: "Namuna", skus: "Tovarlar", units: "Jami qoldiq", search: "Tovar yoki SKU...", col1: "Tovar", col2: "Qoldiq / tan narxi" };

  return (
    <figure className={styles.warehouse}>
      <div className={styles.warehouseHeader}>
        <span>
          <Boxes aria-hidden="true" />
          {labels.title}
        </span>
        <span className={styles.sampleBadge}>{labels.badge}</span>
      </div>
      <div className={styles.warehouseStats}>
        <div>
          <span>{labels.skus}</span>
          <strong>3</strong>
        </div>
        <div>
          <span>{labels.units}</span>
          <strong>60</strong>
        </div>
      </div>
      <div className={styles.warehouseSearch} aria-hidden="true">
        <Search />
        {labels.search}
      </div>
      <div className={styles.warehouseTable}>
        <div className={styles.warehouseTableHead}>
          <span>{labels.col1}</span>
          <span>{labels.col2}</span>
        </div>
        {items.map((product) => (
          <div key={product.sku} className={styles.warehouseRow}>
            <span className={styles.productIcon}>
              <Package aria-hidden="true" />
            </span>
            <div>
              <strong>{product.name}</strong>
              <small>{product.sku}</small>
            </div>
            <div className={styles.stockCell}>
              <strong className={product.empty ? styles.emptyStock : undefined}>{product.stock}</strong>
              <small>{product.cost}</small>
            </div>
          </div>
        ))}
      </div>
      <figcaption>
        {locale === "ru" ? "Упрощенный вид. Демонстрационные данные." : locale === "en" ? "Simplified preview. Sample demonstration data." : "Soddalashtirilgan ko'rinish. Barcha ma'lumotlar namuna."}
      </figcaption>
    </figure>
  );
}
