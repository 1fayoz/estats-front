import { CompareSection } from "@/features/landing/components/compare-section";
import { CtaSection } from "@/features/landing/components/cta-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { LandingFooter } from "@/features/landing/components/footer";
import { HeroSection } from "@/features/landing/components/hero-section";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { MarqueeSection } from "@/features/landing/components/marquee-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { ProductsSection } from "@/features/landing/components/products-section";
import { QuestionsSection } from "@/features/landing/components/questions-section";

/**
 * Tanishtiruv sahifasi.
 *
 * Kirish formasi bu yerdan `/login` ga ko'chirildi: u hero'ning
 * yarmini egallab turardi va mahsulotning o'zini ko'rsatishga joy
 * qolmasdi. Endi hero to'liq kenglikda va markazida ishlab turgan
 * kabinetning haqiqiy rasmi turadi.
 *
 * Sahifa ATAYLAB yorug' (`landing-light`), kabinet esa qorong'i
 * qolaveradi — qorong'i kartochka rasmlari yorug' fonda ajralib
 * turadi va shu bilan e'tiborni o'ziga tortadi.
 */
export default function LandingPage() {
  return (
    <div className="landing-light min-h-svh">
      <LandingHeader />
      <main>
        <HeroSection />
        <MarqueeSection />
        <QuestionsSection />
        <ProductsSection />
        <CompareSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
