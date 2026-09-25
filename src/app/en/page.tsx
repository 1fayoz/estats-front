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
  title: "eStats — Multi-Marketplace Analytics & Inventory Software in Uzbekistan",
  description:
    "Unified operating platform for sellers on Uzum Market, Wildberries, Yandex Market, and Ozon. Real-time FIFO unit economics, FBO/FBS cloud stock control, AI listing SEO, and niche analytics.",
  keywords: [
    "marketplace analytics uzbekistan",
    "uzum market analytics",
    "ecommerce inventory software central asia",
    "zoomselling alternative",
    "multi-marketplace management",
    "fbo fbs stock control",
    "unit economics calculator uzum",
    "uzum market seller tool",
    "wildberries uzbekistan software",
    "yandex market uzbekistan seller",
  ],
  alternates: {
    canonical: "/en",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "eStats — Multi-Marketplace Analytics & Operations Software",
    description:
      "Manage Uzum, Wildberries, Yandex Market, and Ozon stores in one single dashboard with FIFO profit calculations.",
    url: "https://estats.uz/en",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishHomePage() {
  return (
    <main id="asosiy">
      <HeroSection locale="en" />
      <LandingConnections locale="en" />
      <MarketplacesSection locale="en" />
      <QuestionsSection locale="en" />
      <CompareSection locale="en" />
      <ProductsSection locale="en" />
      <PricingSection locale="en" />
      <FaqSection locale="en" />
      <CtaSection locale="en" />
    </main>
  );
}
