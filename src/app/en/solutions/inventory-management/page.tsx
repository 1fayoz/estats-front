import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Cloud Inventory & WMS for E-Commerce Sellers in Uzbekistan | eStats",
  description:
    "Multi-channel inventory management software: FBO and FBS stock synchronization, purchase order batches, barcode printing, and safety stock reorder point alerts.",
  keywords: [
    "ecommerce inventory software uzbekistan",
    "cloud warehouse management central asia",
    "fbo fbs stock sync",
    "barcode generator uzum market",
    "inventory management system tashkent",
  ],
  alternates: {
    canonical: "/en/solutions/inventory-management",
    languages: {
      uz: "/yechimlar/ombor",
      ru: "/ru/yechimlar/ombor",
      en: "/en/solutions/inventory-management",
      "x-default": "/yechimlar/ombor",
    },
  },
  openGraph: {
    title: "Cloud Inventory & WMS for Marketplace Sellers — eStats",
    description: "Manage multi-channel inventory, prevent stockouts, and print marketplace-compliant barcodes.",
    url: "https://estats.uz/en/solutions/inventory-management",
    locale: "en_US",
  },
};

export default function EnglishInventorySolutionPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Solutions", url: "/en" },
          { name: "Inventory Management", url: "/en/solutions/inventory-management" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Boxes className="size-3.5" /> Cloud WMS &amp; Stock Sync
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Cloud Inventory Management for <span className="text-primary">E-Commerce Sellers</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Prevent overselling, avoid stockout penalties, and streamline warehouse fulfillment across Uzum, Wildberries, Yandex Market, and Ozon.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">1. Real-Time Multi-Channel Sync</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When an order arrives on Uzum or Wildberries, available inventory is instantly updated across all channels, eliminating overselling penalties.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">2. Automated Safety Stock Alerts</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Predictive lead-time calculations notify you when stock runs low based on current sales velocity, so you never lose ranking positions.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Take Full Control of Your Warehouse</h2>
          <p className="text-sm text-muted-foreground mt-1">Connect your catalog to eStats WMS in minutes.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Start Managing Stock</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
