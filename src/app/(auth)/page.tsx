import type { Metadata } from "next";

import { CtaSection } from "@/features/landing/components/cta-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { LandingFooter } from "@/features/landing/components/footer";
import { HeroSection, LandingConnections } from "@/features/landing/components/hero-section";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { MarketplacesSection } from "@/features/landing/components/marketplaces-section";
import { CompareSection } from "@/features/landing/components/compare-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { ProductsSection } from "@/features/landing/components/products-section";
import { QuestionsSection } from "@/features/landing/components/questions-section";
import styles from "@/features/landing/components/landing.module.css";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

// Bosh sahifa kanonik va hreflang'ni O'ZI beradi (ilgari ildiz layout'da
// turib, barcha sahifalarga meros bo'lib o'tardi).
export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

export default function LandingPage() {
  return (
    <div className={`landing-light ${styles.page}`}>
      <a href="#asosiy" className={styles.skip}>Asosiy mazmunga o‘tish</a>
      <LandingHeader />
      <main id="asosiy">
        <HeroSection />
        <LandingConnections />
        <MarketplacesSection />
        <QuestionsSection />
        <CompareSection />
        <ProductsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
