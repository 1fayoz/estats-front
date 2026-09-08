import { CtaSection } from "@/features/landing/components/cta-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { LandingFooter } from "@/features/landing/components/footer";
import { HeroSection, LandingConnections } from "@/features/landing/components/hero-section";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { ProductsSection } from "@/features/landing/components/products-section";
import { QuestionsSection } from "@/features/landing/components/questions-section";
import styles from "@/features/landing/components/landing.module.css";

export default function LandingPage() {
  return (
    <div className={`landing-light ${styles.page}`}>
      <a href="#asosiy" className={styles.skip}>Asosiy mazmunga o‘tish</a>
      <LandingHeader />
      <main id="asosiy">
        <HeroSection />
        <LandingConnections />
        <QuestionsSection />
        <ProductsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
