import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Cpu, Flame, Smartphone, TrendingUp, Users } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Electronics & Tech Category Intelligence: Uzum Market Analytics | eStats",
  description:
    "Comprehensive market analysis of consumer electronics, mobile accessories, and home tech on Uzum Market: monthly sales volume, average order value, top sellers, and low-competition niches.",
  keywords: [
    "uzum market electronics analytics",
    "top selling products uzbekistan",
    "electronics category revenue central asia",
    "mobile accessories uzum market",
    "market intelligence uzbekistan",
  ],
  alternates: {
    canonical: "/en/categories/electronics",
    languages: {
      uz: "/kategoriya/elektronika",
      ru: "/ru/kategoriya/elektronika",
      en: "/en/categories/electronics",
    },
  },
  openGraph: {
    title: "Electronics Category Analytics — Uzum Market | eStats",
    description: "Deep data breakdown of consumer electronics and tech sales in Uzbekistan.",
    url: "https://estats.uz/en/categories/electronics",
    images: ["https://estats.uz/api/og?title=Electronics+Category+Intelligence&badge=eStats+Market"],
  },
};

const FAQ_ITEMS = [
  {
    question: "Is electronics a good category for new sellers entering Uzum Market?",
    answer:
      "Electronics generates the largest overall gross merchandise value (GMV), but features high competition. Instead of generic phone cables and cases, successful merchants target specialized sub-niches like automotive electronics, smart home gadgets, or specialized adapters.",
  },
  {
    question: "What is the typical marketplace commission rate for electronics?",
    answer:
      "Depending on the subcategory, Uzum Market commissions range between 5% and 12%. You can calculate exact margins using our free marketplace commission calculator.",
  },
];

export default function EnElectronicsCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Categories", url: "/en" },
          { name: "Electronics", url: "/en/categories/electronics" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Cpu className="size-3.5" /> Market Niche Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Electronics &amp; Smart Gadgets Category Analysis
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground leading-relaxed">
          Electronics accounts for over 28% of total e-commerce revenue on Uzum Market. Explore sales velocity, pricing segments, customer demand, and margin potential across top subcategories.
        </p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground block mb-1">Monthly Segment GMV</span>
          <span className="text-xl sm:text-2xl font-black text-foreground">65+ Billion</span>
          <span className="text-[11px] text-emerald-500 font-bold block mt-1">+34% YoY Growth</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground block mb-1">Average Order Value</span>
          <span className="text-xl sm:text-2xl font-black text-primary">165,000 UZS</span>
          <span className="text-[11px] text-muted-foreground block mt-1">High conversion</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground block mb-1">Active Listings</span>
          <span className="text-xl sm:text-2xl font-black text-foreground">42,000+</span>
          <span className="text-[11px] text-amber-500 font-semibold block mt-1">Moderate competition</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="text-xs text-muted-foreground block mb-1">Platform Commission</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">5% – 12%</span>
          <span className="text-[11px] text-muted-foreground block mt-1">Category fee</span>
        </div>
      </div>

      {/* Subcategory Performance Table */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" /> Top Performing Sub-Niches
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Sub-Niche</th>
                <th className="py-2.5 px-3">Monthly Sales</th>
                <th className="py-2.5 px-3">Average Price</th>
                <th className="py-2.5 px-3">Competitive Intensity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-3 px-3 font-bold text-foreground">Bluetooth Earbuds &amp; Audio</td>
                <td className="py-3 px-3">18.5 Billion UZS</td>
                <td className="py-3 px-3">145,000 UZS</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[10px]">High</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-foreground">Smart Watches &amp; Bands</td>
                <td className="py-3 px-3">14.2 Billion UZS</td>
                <td className="py-3 px-3">220,000 UZS</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]">Medium</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-foreground">Power Banks &amp; Fast Chargers</td>
                <td className="py-3 px-3">12.1 Billion UZS</td>
                <td className="py-3 px-3">125,000 UZS</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]">Medium</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-foreground">Automotive FM &amp; Smart Accessories</td>
                <td className="py-3 px-3">8.4 Billion UZS</td>
                <td className="py-3 px-3">95,000 UZS</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">Low / Opportunity</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-foreground">Find Untapped Niches with eStats Scanner</h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Inspect any competitor product on Uzum Market to uncover exact daily order counts, inventory levels, and revenue trends.
          </p>
        </div>
        <Link
          href="/en/tools/product-checker"
          className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground text-xs shadow hover:opacity-90 transition whitespace-nowrap"
        >
          Launch Free Product Scanner
        </Link>
      </div>
    </article>
  );
}
