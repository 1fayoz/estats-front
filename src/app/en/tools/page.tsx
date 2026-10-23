import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { CalculatorsHub } from "@/features/calculators/calculators-hub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free E-Commerce & Marketplace Calculators",
  description:
    "Free operational tools and calculators for marketplace sellers: barcode & label generator, unit economics, ABC analysis, and marketplace commission calculators.",
  path: "/en/tools",
  keywords: [
    "marketplace calculators",
    "free e-commerce tools",
    "barcode generator online",
    "abc inventory calculator",
    "unit economics calculator",
  ],
  ogTitle: "Free E-Commerce & Marketplace Calculators — eStats",
  ogDescription: "Online barcode generator, unit economics, ABC analysis, and commission calculators.",
});

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
