import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Globe2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Multi-Marketplace Analytics in Central Asia — Uzum, WB, Yandex, Ozon | eStats",
  description:
    "Unified multi-channel analytics for marketplace sellers in Uzbekistan: real-time sales revenue, return rates, pricing dynamics, and competitor bench-marking.",
  keywords: [
    "marketplace analytics uzbekistan",
    "uzum market analytics",
    "central asia ecommerce software",
    "multi marketplace dashboard",
    "wildberries yandex uzbekistan analytics",
  ],
  alternates: {
    canonical: "/en/solutions/marketplace-analytics",
    languages: {
      uz: "/yechimlar/bozor",
      ru: "/ru/yechimlar/moliya",
      en: "/en/solutions/marketplace-analytics",
      "x-default": "/yechimlar/bozor",
    },
  },
  openGraph: {
    title: "Multi-Marketplace Analytics in Central Asia — eStats",
    description: "Track multi-channel orders, revenue trends, and competitor price changes in real time.",
    url: "https://estats.uz/en/solutions/marketplace-analytics",
    locale: "en_US",
  },
};

export default function EnglishMarketplaceAnalyticsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Solutions", url: "/en" },
          { name: "Marketplace Analytics", url: "/en/solutions/marketplace-analytics" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <TrendingUp className="size-3.5" /> Multi-Marketplace Intelligence
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketplace Analytics for <span className="text-primary">Uzbekistan &amp; Central Asia</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Monitor your stores on Uzum Market, Wildberries, Yandex Market, and Ozon in one unified executive dashboard.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">Consolidated Sales Pipeline</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eliminate the pain of logging into multiple seller portals daily. Track gross merchandise value (GMV), order volume, and fulfillment velocity in real time.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">True FIFO Profitability</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our accounting engine matches sales directly against purchase batch costs, deducting commission tiers and return logistics to reveal your exact net profit.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Experience Enterprise-Grade Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Start your free trial today with instant setup.</p>
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
