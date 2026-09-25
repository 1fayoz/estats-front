import type { Metadata } from "next";
import { HeroSection, LandingConnections } from "@/features/landing/components/hero-section";
import { MarketplacesSection } from "@/features/landing/components/marketplaces-section";
import { QuestionsSection } from "@/features/landing/components/questions-section";
import { CompareSection } from "@/features/landing/components/compare-section";
import { ProductsSection } from "@/features/landing/components/products-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { CtaSection } from "@/features/landing/components/cta-section";

export const metadata: Metadata = {
  title: "eStats — Аналитика и Управление Продажами на Uzum Market, Wildberries, Yandex Market и Ozon",
  description:
    "Единая экосистема для селлеров маркетплейсов в Узбекистане. Точная себестоимость по FIFO, учет чистой прибыли PnL, остатки на складах FBO/FBS, AI оптимизация карточек и аналитика ниш.",
  keywords: [
    "аналитика uzum market",
    "аналитика маркетплейсов узбекистан",
    "калькулятор uzum market",
    "программа для склада узбекистан",
    "учет товаров маркетплейс",
    "аналог zoomselling",
    "1с для узбекских маркетплейсов",
    "wildberries узбекистан аналитика",
    "яндекс маркет узбекистан",
    "ozon узбекистан селлер",
    "себестоимость fifo узбекистан",
    "юнит экономика маркетплейс",
  ],
  alternates: {
    canonical: "/ru",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "eStats — Аналитика и Управление Продажами на Маркетплейсах",
    description:
      "Управляйте продажами на Uzum, Wildberries, Yandex Market и Ozon в едином окне. Точная чистая прибыль и складской учет.",
    url: "https://estats.uz/ru",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RussianHomePage() {
  return (
    <main id="asosiy">
      <HeroSection locale="ru" />
      <LandingConnections locale="ru" />
      <MarketplacesSection locale="ru" />
      <QuestionsSection locale="ru" />
      <CompareSection locale="ru" />
      <ProductsSection locale="ru" />
      <PricingSection locale="ru" />
      <FaqSection locale="ru" />
      <CtaSection locale="ru" />
    </main>
  );
}
