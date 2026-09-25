import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "AI Product Listing SEO for Central Asian Marketplaces | eStats",
  description:
    "Rank #1 on Uzum Market, Wildberries, and Yandex Market using AI optimization: generate high-intent search keywords, bilingual titles, and high-converting listing copy.",
  keywords: [
    "ai listing seo uzum",
    "marketplace seo software uzbekistan",
    "ecommerce copy generator central asia",
    "bilingual product descriptions uzbek russian",
    "search rank optimization uzum market",
  ],
  alternates: {
    canonical: "/en/solutions/ai-seo",
    languages: {
      uz: "/yechimlar/tovar-seo",
      ru: "/ru/yechimlar/tovar-seo",
      en: "/en/solutions/ai-seo",
      "x-default": "/yechimlar/tovar-seo",
    },
  },
  openGraph: {
    title: "AI Product Listing SEO for Marketplaces — eStats",
    description: "Automate keyword research and optimize listings for maximum visibility.",
    url: "https://estats.uz/en/solutions/ai-seo",
    locale: "en_US",
  },
};

export default function EnglishSeoSolutionPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Solutions", url: "/en" },
          { name: "AI Listing SEO", url: "/en/solutions/ai-seo" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> AI Listing Optimization
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          AI-Powered Product Listing SEO for <span className="text-primary">Uzum Market &amp; Beyond</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Boost organic click-through rates and conversion rates by up to 35% with specialized bilingual copy engineered specifically for local search queries.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">1. High-Intent Keyword Extraction</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Uncover high-volume, low-competition keywords typed by buyers in Uzbekistan, automatically embedding them in titles and attribute parameters.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">2. Native Bilingual Copywriting</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate fluent Uzbek and Russian descriptions that address buyer hesitations, highlight key USPs, and maximize conversion rate.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Dominate Search Rankings with AI</h2>
          <p className="text-sm text-muted-foreground mt-1">Optimize your first catalog listing for free.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Try AI SEO Free</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
