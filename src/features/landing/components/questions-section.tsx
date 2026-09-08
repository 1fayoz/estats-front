"use client";

import * as React from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, Boxes, ChartNoAxesCombined, Check, Globe2, Package, Search, Sparkles } from "lucide-react";

import base from "./landing.module.css";
import styles from "./landing-features.module.css";

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

const FEATURES: Feature[] = [
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
];

export function QuestionsSection() {
  const [active, setActive] = React.useState<FeatureId>("seo");
  const selected = FEATURES.find((feature) => feature.id === active) ?? FEATURES[0];

  return (
    <section id="imkoniyatlar" className={styles.features} aria-labelledby="features-title">
      <div className={base.container}>
        <div className={styles.sectionIntro}>
          <div>
            <p className={base.eyebrow}>Imkoniyatlar</p>
            <h2 id="features-title" className={base.sectionTitle}>Har bir vazifaga<br />o'z ish quroli.</h2>
          </div>
          <p className={base.lead}>Tovarni topishdan foydani hisoblashgacha. Kerakli bo'limni tanlang va eStats qanday yordam berishini ko'ring.</p>
        </div>

        <Tabs.Root value={active} onValueChange={(value) => setActive(value as FeatureId)} className={styles.tabs}>
          <Tabs.List aria-label="eStats imkoniyatlari" className={styles.tabList}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return <Tabs.Trigger key={feature.id} value={feature.id} className={styles.tab}><Icon aria-hidden="true" /><span>{feature.label}</span></Tabs.Trigger>;
            })}
          </Tabs.List>

          <Tabs.Content key={selected.id} value={selected.id} className={styles.featurePanel}>
            <div className={styles.featureCopy}>
              <p className={styles.featureEyebrow}>{selected.eyebrow}</p>
              <h3>{selected.title}</h3>
              <p className={styles.featureDescription}>{selected.description}</p>
              <ul className={styles.featurePoints}>{selected.points.map((point) => <li key={point}><span><Check aria-hidden="true" /></span>{point}</li>)}</ul>
              <Link href="/login" className={base.textLink}>Kabinetga o'tish <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.preview}>
              {selected.screenshot ? <ScreenshotPreview key={selected.id} screenshot={selected.screenshot} /> : <WarehousePreview />}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
}

function ScreenshotPreview({ screenshot }: { screenshot: NonNullable<Feature["screenshot"]> }) {
  return (
    <figure className={styles.screenshot}>
      <div className={styles.browserBar} aria-hidden="true"><span className={styles.browserDots}><i /><i /><i /></span><span>{screenshot.path}</span><span className={styles.browserLabel}>eStats</span></div>
      <div className={styles.screenshotWindow}>
        <picture>
          <source media="(max-width: 767px)" srcSet={screenshot.mobile} />
          <img src={screenshot.desktop} alt={screenshot.alt} width={1456} height={829} loading="lazy" decoding="async" />
        </picture>
      </div>
      <figcaption>Mahsulot ekranidan namuna<span className={styles.mobileCaption}> · ekranning bir qismi</span>. Raqamlar misol uchun.</figcaption>
    </figure>
  );
}

const SAMPLE_PRODUCTS = [
  { name: "Termos, 450 ml", sku: "TRM-450", stock: "48 dona", cost: "30 000 so'm", empty: false },
  { name: "Stol chirog'i", sku: "LMP-012", stock: "12 dona", cost: "55 000 so'm", empty: false },
  { name: "Ryukzak, 20 l", sku: "BAG-020", stock: "0 dona", cost: "85 000 so'm", empty: true },
];

function WarehousePreview() {
  return (
    <figure className={styles.warehouse}>
      <div className={styles.warehouseHeader}><span><Boxes aria-hidden="true" />Ombor</span><span className={styles.sampleBadge}>Namuna</span></div>
      <div className={styles.warehouseStats}><div><span>Tovarlar</span><strong>3 <small>ta</small></strong></div><div><span>Jami qoldiq</span><strong>60 <small>dona</small></strong></div></div>
      <div className={styles.warehouseSearch} aria-hidden="true"><Search />Tovar yoki SKU...</div>
      <div className={styles.warehouseTable}>
        <div className={styles.warehouseTableHead}><span>Tovar</span><span>Qoldiq / tan narxi</span></div>
        {SAMPLE_PRODUCTS.map((product) => <div key={product.sku} className={styles.warehouseRow}><span className={styles.productIcon}><Package aria-hidden="true" /></span><div><strong>{product.name}</strong><small>{product.sku}</small></div><div className={styles.stockCell}><strong className={product.empty ? styles.emptyStock : undefined}>{product.stock}</strong><small>{product.cost}</small></div></div>)}
      </div>
      <figcaption>Soddalashtirilgan ko'rinish. Barcha ma'lumotlar namuna.</figcaption>
    </figure>
  );
}
