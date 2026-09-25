import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналог SellerFox для Маркетплейсов в Узбекистане — eStats | Сравнение",
  description:
    "Ищете аналог SellerFox? Платформа eStats объединяет анализ ниш, партионную себестоимость по FIFO и мульти-маркетплейс для Uzum Market, Wildberries, Yandex Market и Ozon.",
  keywords: [
    "аналог sellerfox узбекистан",
    "sellerfox uzum market",
    "sellerfox альтернатива",
    "аналитика маркетплейсов узбекистан",
    "мониторинг конкурентов uzum",
  ],
  alternates: {
    canonical: "/ru/muqobil/sellerfox",
    languages: {
      uz: "/muqobil/sellerfox",
      ru: "/ru/muqobil/sellerfox",
    },
  },
  openGraph: {
    title: "Аналог SellerFox для Узбекистана — eStats",
    description: "Мульти-маркетплейс платформа для продавцов в Центральной Азии.",
    url: "https://estats.uz/ru/muqobil/sellerfox",
  },
};

const FAQ_ITEMS = [
  {
    question: "Кому больше подходит eStats по сравнению с SellerFox?",
    answer:
      "SellerFox ориентирован на рынок РФ и не учитывает комиссионную сетку Uzum Market и расчеты в узбекских сумах. eStats создан специально для селлеров Узбекистана, одновременно поддерживая трансграничную торговлю на Wildberries и Ozon.",
  },
  {
    question: "Как защищены коммерческие данные селлера?",
    answer:
      "API ключи, себестоимость и финансовые отчеты каждого продавца шифруются по банковским стандартам и изолированы в защищенной облачной базе. Доступ открыт только владельцу аккаунта.",
  },
];

export default function RussianSellerfoxAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Сравнение", url: "/ru/muqobil/zoomselling" },
          { name: "Аналог SellerFox", url: "/ru/muqobil/sellerfox" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="size-3.5" /> SellerFox vs eStats
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналог SellerFox для Узбекистана: <span className="text-primary">Почему выбирают eStats?</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Uzum Market, Yandex Market, Wildberries и Ozon в едином удобном интерфейсе с точным партионным учетом.
        </p>
      </header>

      {/* Comparison table */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold">Сравнение ключевых модулей</h2>
          <p className="text-xs text-muted-foreground mt-1">SellerFox против eStats</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="p-4 sm:p-5">Возможности</th>
                <th className="p-4 sm:p-5">SellerFox</th>
                <th className="p-4 sm:p-5 text-primary">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-4 font-medium">Поддержка Uzum Market</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Полная интеграция</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Расчет себестоимости по партиям (FIFO)</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Да (партиями)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Складской учет и уведомления о точке заказа</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Да (FBO / FBS)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Оплата в национальной валюте (UZS)</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Только рубли</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Payme / Click / Б/Н</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Начните работу с eStats бесплатно</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Опробуйте все аналитические и учетные инструменты прямо сейчас без привязки банковской карты.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Начать бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
