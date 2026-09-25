import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Rocket, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "E-Commerce Knowledge Base & Selling Guides | eStats",
  description:
    "Comprehensive guides and playbooks for selling on Central Asian marketplaces: Uzum Market seller onboarding, product listing SEO, FBO vs FBS models, and advertising optimization.",
  keywords: [
    "how to sell on uzum market",
    "uzbekistan marketplace guides",
    "uzum seller registration",
    "cross border selling uzbekistan",
    "e-commerce central asia",
  ],
  alternates: {
    canonical: "/en/guides",
    languages: {
      uz: "/qollanma",
      ru: "/ru/qollanma",
      en: "/en/guides",
    },
  },
  openGraph: {
    title: "Marketplace Guides & Seller Knowledge Base — eStats",
    description: "Step-by-step masterclasses on launching and scaling e-commerce stores in Uzbekistan.",
    url: "https://estats.uz/en/guides",
    images: ["https://estats.uz/api/og?title=Marketplace+Guides+%26+Playbooks&badge=eStats+Knowledge"],
  },
};

const GUIDES = [
  {
    slug: "how-to-sell-on-uzum-market",
    title: "How to Start Selling on Uzum Market in 2026: Complete Seller Guide",
    description:
      "A step-by-step roadmap to register a business, sign seller agreements, prepare barcodes, and launch your first product shipment in Uzbekistan.",
    tag: "Getting Started",
    icon: Rocket,
  },
  {
    slug: "../tools/barcode-generator",
    title: "Marketplace Thermal Label & Barcode Generation Guide",
    description:
      "How to format Code-128 and 58x40 mm thermal stickers to pass warehouse fulfillment checks without rejections.",
    tag: "Logistics",
    icon: ShieldCheck,
  },
  {
    slug: "../tools/abc-analysis",
    title: "Pareto 80/20 ABC Inventory Analysis for Marketplace Catalogs",
    description:
      "Learn how to classify high-velocity revenue drivers versus capital-draining dead stock to optimize inventory cash flow.",
    tag: "Inventory",
    icon: TrendingUp,
  },
];

export default function EnGuidesHubPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Guides", url: "/en/guides" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" /> Seller Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Marketplace Knowledge Base &amp; Seller Playbooks
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground leading-relaxed">
          Actionable, data-driven playbooks crafted by top e-commerce operators to help you launch, optimize unit margins, and scale multi-channel operations across Uzbekistan and Central Asia.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <Link
              key={guide.slug}
              href={`/en/guides/${guide.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:scale-105 transition transform">
                    <Icon className="size-5" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {guide.tag}
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                  {guide.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {guide.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary pt-3 border-t border-border/60">
                Read Guide <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
