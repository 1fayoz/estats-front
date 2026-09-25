import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { CalculatorsHub } from "@/features/calculators/calculators-hub";

export const metadata: Metadata = {
  title: "Free E-Commerce & Marketplace Calculators | eStats",
  description:
    "Free operational tools and calculators for marketplace sellers: barcode & label generator, unit economics, ABC analysis, and marketplace commission calculators.",
  keywords: [
    "marketplace calculators",
    "free e-commerce tools",
    "barcode generator online",
    "abc inventory calculator",
    "unit economics calculator",
  ],
  alternates: {
    canonical: "/en/tools",
    languages: {
      uz: "/kalkulyator",
      ru: "/ru/kalkulyator",
      en: "/en/tools",
    },
  },
  openGraph: {
    title: "Free E-Commerce & Marketplace Calculators — eStats",
    description: "Online barcode generator, unit economics, ABC analysis, and commission calculators.",
    url: "https://estats.uz/en/tools",
    images: ["https://estats.uz/api/og?title=Free+Marketplace+Tools&badge=eStats+Global"],
  },
};

const FAQ_ITEMS = [
  {
    question: "Are these tools completely free to use?",
    answer:
      "Yes, all calculators and tools are 100% free with no registration required.",
  },
  {
    question: "Which marketplaces are supported?",
    answer:
      "Formulas and templates support regional and international platforms including Uzum Market, Wildberries, Yandex Market, and Ozon.",
  },
  {
    question: "How does the full eStats platform differ from these free tools?",
    answer:
      "The full eStats operating system connects to your seller API accounts, synchronizing live multi-warehouse stocks, calculating FIFO unit costs, and tracking daily net profit.",
  },
];

export default function EnToolsHubPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Free Tools", url: "/en/tools" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <CalculatorsHub locale="en" />
    </article>
  );
}
