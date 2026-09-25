import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "ZoomSelling Alternative — eStats | Multi-Marketplace Analytics & ERP",
  description:
    "Looking for a better ZoomSelling alternative in Uzbekistan? eStats delivers true FIFO costing, full warehouse inventory control, multi-marketplace sync (WB, Yandex, Ozon), and AI listing optimization.",
  keywords: [
    "zoomselling alternative",
    "zoomselling uzum market",
    "best marketplace tool uzbekistan",
    "estats vs zoomselling",
    "uzum seller analytics software",
  ],
  alternates: {
    canonical: "/en/alternatives/zoomselling",
    languages: {
      uz: "/muqobil/zoomselling",
      ru: "/ru/muqobil/zoomselling",
      en: "/en/alternatives/zoomselling",
      "x-default": "/muqobil/zoomselling",
    },
  },
  openGraph: {
    title: "ZoomSelling Alternative in Central Asia — eStats",
    description: "Compare ZoomSelling with eStats: multi-marketplace, FIFO costing, and cloud WMS.",
    url: "https://estats.uz/en/alternatives/zoomselling",
    locale: "en_US",
  },
};

const FAQ_ITEMS = [
  {
    question: "What is the key difference between ZoomSelling and eStats?",
    answer:
      "ZoomSelling primarily offers single-channel sales scraping for Uzum Market. In contrast, eStats provides a complete operations suite: batch FIFO unit costing, multi-channel support (Uzum, WB, Yandex, Ozon), real-time Telegram sales alerts, warehouse WMS, and AI product optimization.",
  },
  {
    question: "How long does migration from ZoomSelling take?",
    answer:
      "Less than 2 minutes. You simply link your marketplace API keys, and eStats instantly backfills historical sales and catalog inventory.",
  },
];

const COMPARISON = [
  { feature: "Uzum Market sales analytics", zoomselling: true, estats: true },
  { feature: "Wildberries, Yandex Market & Ozon integrations", zoomselling: false, estats: true },
  { feature: "Batch FIFO unit economics and PnL reporting", zoomselling: false, estats: true },
  { feature: "Cloud warehouse inventory and stock sync", zoomselling: false, estats: true },
  { feature: "Overhead expense allocation across SKUs", zoomselling: false, estats: true },
  { feature: "Bilingual AI listing generator (Uzbek & Russian)", zoomselling: false, estats: true },
  { feature: "Instant Telegram notifications for sales & returns", zoomselling: false, estats: true },
  { feature: "Browser Chrome extension for in-card metrics", zoomselling: true, estats: true },
];

export default function EnglishZoomSellingAlternativePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Alternatives", url: "/en" },
          { name: "ZoomSelling Alternative", url: "/en/alternatives/zoomselling" },
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
          <Sparkles className="size-3.5" /> Platform Comparison
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          The Modern <span className="text-primary">ZoomSelling Alternative</span> for Central Asia
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Why growing e-commerce sellers choose eStats for batch-level profitability, cloud inventory, and multi-channel scale.
        </p>
      </header>

      {/* Comparison Table */}
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="p-6 border-b bg-muted/20 sm:p-8">
          <h2 className="text-xl font-bold">Feature Comparison Matrix</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Compare ZoomSelling capabilities directly with eStats.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="p-4 sm:p-5">Capability / Feature</th>
                <th className="p-4 text-center sm:p-5 w-36">ZoomSelling</th>
                <th className="p-4 text-center sm:p-5 w-36 bg-primary/5 text-primary font-bold">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {COMPARISON.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition">
                  <td className="p-4 sm:p-5 font-medium text-foreground">{row.feature}</td>
                  <td className="p-4 text-center sm:p-5">
                    {row.zoomselling ? (
                      <Check className="size-5 text-emerald-600 inline" />
                    ) : (
                      <X className="size-5 text-rose-500 inline opacity-40" />
                    )}
                  </td>
                  <td className="p-4 text-center sm:p-5 bg-primary/5">
                    {row.estats ? (
                      <Check className="size-5 text-primary inline font-bold" />
                    ) : (
                      <X className="size-5 text-rose-500 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Switch CTA */}
      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Switch to eStats Today</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create your account and connect your first marketplace store for free.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Get Started Free</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
