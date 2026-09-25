import type { Metadata } from "next";
import { PublicProductScanner } from "@/features/scanner/public-product-scanner";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Сканер Товаров Uzum Market — Проверка Продаж и Выручки Онлайн | eStats",
  description:
    "Бесплатная проверка любого товара на Uzum Market по ссылке или ID: оценка ежемесячных продаж, выручки, конкурентоспособности цены и аудит SEO карточки товара.",
  keywords: [
    "сканер uzum market",
    "проверка товара uzum",
    "анализ товара узбекистан",
    "выручка товара uzum",
    "статистика продаж узбекистан",
    "аналитика карточки товара uzum",
  ],
  alternates: {
    canonical: "/ru/tekshirish",
    languages: {
      uz: "/tekshirish",
      ru: "/ru/tekshirish",
      en: "/en/tools/product-checker",
      "x-default": "/tekshirish",
    },
  },
  openGraph: {
    title: "Сканер Товаров Uzum Market — Онлайн Анализ Продаж",
    description: "Проверьте продажи, выручку и качество SEO карточки любого товара на Uzum Market.",
    url: "https://estats.uz/ru/tekshirish",
    locale: "ru_RU",
  },
};

export default function RussianScannerPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-10">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструменты", url: "/ru" },
          { name: "Сканер товаров Uzum", url: "/ru/tekshirish" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Сканер товаров <span className="text-primary">Uzum Market</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Мгновенная аналитика любого товара на узбекском маркетплейсе: оцените объем заказов, оборот и потенциал до закупки партии.
        </p>
      </header>

      <PublicProductScanner locale="ru" />

      <section className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Как работает проверка товара?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Алгоритм eStats собирает актуальные данные об остатках, частоте обновления отзывов, рейтинге и динамике изменения цены. Это позволяет селлеру точно определить емкость ниши и не вкладывать капитал в неликвидные товары.
        </p>
      </section>
    </div>
  );
}
