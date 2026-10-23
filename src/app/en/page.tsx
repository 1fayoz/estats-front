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
  title: "eStats — Marketplace Analytics for Uzum Market",
  description:
    "One platform for Uzum Market, Wildberries, Yandex Market and Ozon sellers: FIFO unit economics, FBO/FBS stock control, AI listing SEO and niche analytics.",
  path: "/en",
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
  ogTitle: "eStats — Multi-Marketplace Analytics & Operations Software",
  ogDescription: "Manage Uzum, Wildberries, Yandex Market, and Ozon stores in one single dashboard with FIFO profit calculations.",
  absoluteTitle: true,
});

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
