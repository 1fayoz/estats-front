import type { Metadata } from "next";
import { HeroSection, LandingConnections } from "@/features/landing/components/hero-section";
import { MarketplacesSection } from "@/features/landing/components/marketplaces-section";
import { QuestionsSection } from "@/features/landing/components/questions-section";
import { CompareSection } from "@/features/landing/components/compare-section";
import { ProductsSection } from "@/features/landing/components/products-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { CtaSection } from "@/features/landing/components/cta-section";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "eStats — аналитика Uzum Market, Wildberries и Ozon",
  description:
    "Экосистема для селлеров маркетплейсов Узбекистана: себестоимость по FIFO, чистая прибыль PnL, остатки FBO/FBS, AI карточки и аналитика ниш.",
  path: "/ru",
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
  ogTitle: "eStats — Аналитика и Управление Продажами на Маркетплейсах",
  ogDescription: "Управляйте продажами на Uzum, Wildberries, Yandex Market и Ozon в едином окне. Точная чистая прибыль и складской учет.",
  absoluteTitle: true,
});

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
