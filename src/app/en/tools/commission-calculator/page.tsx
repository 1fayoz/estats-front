import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Check } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { UzumCommissionCalculator } from "@/features/calculators/uzum-commission-calculator";

export const metadata: Metadata = {
  title: "Uzum Market Commission & Profit Calculator (2026) | eStats",
  description:
    "Free online commission calculator for Uzum Market sellers in Uzbekistan. Calculate category referral fees, FBO logistics, unit cost, and net margins.",
  keywords: [
    "uzum market commission calculator",
    "uzum marketplace seller fees",
    "uzbekistan ecommerce profit calculator",
    "uzum unit economics",
    "central asia ecommerce seller calculator",
  ],
  alternates: {
    canonical: "/en/tools/commission-calculator",
    languages: {
      uz: "/kalkulyator/uzum-komissiya",
      ru: "/ru/kalkulyator/uzum-komissiya",
      en: "/en/tools/commission-calculator",
      "x-default": "/kalkulyator/uzum-komissiya",
    },
  },
  openGraph: {
    title: "Uzum Market Commission & Profit Calculator — eStats",
    description: "Model Uzum marketplace fees and unit net profit before purchasing inventory.",
    url: "https://estats.uz/en/tools/commission-calculator",
    locale: "en_US",
  },
};

const FAQ_ITEMS = [
  {
    question: "What are the standard commission tiers on Uzum Market?",
    answer:
      "Commission rates range between 3% and 25% depending on category. For example, consumer electronics ranges between 5-10%, while apparel and footwear typically sit between 15-20%.",
  },
  {
    question: "What expenses are included in FBO logistics?",
    answer:
      "FBO fulfillment includes sorting, sorting center cross-docking, and parcel delivery to pickup points (PVZ) across all regions of Uzbekistan.",
  },
];

export default function EnglishCommissionCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Tools", url: "/en" },
          { name: "Uzum Commission Calculator", url: "/en/tools/commission-calculator" },
        ]}
      />
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Calculator className="size-3.5" /> 2026 Updated Rates
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Commission Calculator</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Accurately calculate net margin, FBO logistics deduction, and return on investment (ROI) per inventory unit.
        </p>
      </header>

      <UzumCommissionCalculator locale="en" />

      <section className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Automated Unit Economics with eStats</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connecting your store to eStats gives you real-time FIFO margin calculations without manual entry. All order returns, storage fees, and promotional discounts are deducted automatically.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
