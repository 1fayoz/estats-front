import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { AbcAnalysisCalculator } from "@/features/calculators/abc-analysis-calculator";

export const metadata: Metadata = {
  title: "Inventory ABC Analysis Calculator (80/20 Pareto Principle) | eStats",
  description:
    "Free online ABC product inventory segmentation tool for multi-channel marketplace sellers. Separate high-revenue Group A items from deadweight Group C stock.",
  keywords: [
    "abc analysis calculator",
    "inventory pareto 80 20 rule",
    "marketplace product matrix audit",
    "e-commerce stock classification",
    "dead stock identifier tool",
  ],
  alternates: {
    canonical: "/en/tools/abc-analysis",
    languages: {
      uz: "/kalkulyator/abc-tahlil",
      ru: "/ru/kalkulyator/abc-tahlil",
      en: "/en/tools/abc-analysis",
    },
  },
  openGraph: {
    title: "Inventory ABC Analysis Calculator — eStats",
    description: "Analyze your SKU revenue distribution and optimize inventory replenishment.",
    url: "https://estats.uz/en/tools/abc-analysis",
    images: ["https://estats.uz/api/og?title=Inventory+ABC+Analysis+Calculator&badge=eStats+Tools"],
  },
};

const FAQ_ITEMS = [
  {
    question: "What is an ABC inventory analysis?",
    answer:
      "ABC analysis is an inventory categorization technique based on the Pareto Principle. It groups catalog items into Category A (80% of revenue), Category B (15%), and Category C (5%) to prioritize procurement and stock control.",
  },
  {
    question: "How should Category A products be managed?",
    answer:
      "Category A products are your primary revenue drivers. They require strict safety stock limits, frequent replenishment, and zero toleration for Out-of-Stock events.",
  },
  {
    question: "What is the recommended strategy for Category C items?",
    answer:
      "Category C goods represent low velocity and sluggish inventory. Sellers should discount, bundle, or run promotions to liberate locked working capital.",
  },
];

export default function EnAbcAnalysisPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Tools", url: "/en/tools/barcode-generator" },
          { name: "ABC Analysis", url: "/en/tools/abc-analysis" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <AbcAnalysisCalculator locale="en" />
    </article>
  );
}
