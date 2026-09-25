import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  DollarSign,
  Globe2,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "eStats — Multi-Marketplace Analytics & Inventory Software in Uzbekistan",
  description:
    "Unified operating platform for sellers on Uzum Market, Wildberries, Yandex Market, and Ozon. Real-time FIFO unit economics, FBO/FBS cloud stock control, AI listing SEO, and niche analytics.",
  keywords: [
    "marketplace analytics uzbekistan",
    "uzum market analytics",
    "ecommerce inventory software central asia",
    "zoomselling alternative",
    "multi-marketplace management",
    "fbo fbs stock control",
    "unit economics calculator uzum",
    "uzum market seller tool",
    "wildberries uzbekistan software",
    "yandex market uzbekistan seller",
  ],
  alternates: {
    canonical: "/en",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "eStats — Multi-Marketplace Analytics & Operations Software",
    description:
      "Manage Uzum, Wildberries, Yandex Market, and Ozon stores in one single dashboard with FIFO profit calculations.",
    url: "https://estats.uz/en",
    locale: "en_US",
    type: "website",
  },
};

const FAQ_ITEMS = [
  {
    q: "Which marketplaces are supported by eStats?",
    a: "eStats currently supports the dominant e-commerce channels in Uzbekistan and Central Asia: Uzum Market, Wildberries, Yandex Market, and Ozon, with upcoming Telegram and Instagram commerce integrations.",
  },
  {
    q: "How does eStats calculate net profit and unit economics?",
    a: "Unlike simplistic scrapers, eStats uses the industry-standard FIFO (First-In, First-Out) inventory costing model. It accounts for varying purchase batch costs, marketplace commissions, logistics fees, customer returns, and operating overheads.",
  },
  {
    q: "Is eStats a suitable replacement for 1C or MoySklad?",
    a: "Yes. eStats is cloud-native, modern, and built specifically for marketplace workflows. It eliminates the need for expensive 1C server setups, specialized programmers, or clunky spreadsheet synchronization.",
  },
  {
    q: "Can I use free tools without an account?",
    a: "Yes! We provide free public calculators for Uzum commission rates, unit economics calculations, and a real-time product link scanner with no registration required.",
  },
];

export default function EnglishHomePage() {
  return (
    <div className="space-y-20 py-8 sm:py-16">
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.q,
          answer: item.a,
        }))}
      />

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-5 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>#1 Multi-Marketplace Platform in Central Asia</span>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.15]">
          All-in-one analytics &amp; operations for{" "}
          <span className="text-primary">Uzum, Wildberries, Yandex &amp; Ozon</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
          Automate FIFO cost-of-goods calculations, synchronize FBO and FBS stock levels, optimize product listings with AI, and grow your e-commerce business without messy spreadsheets.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/en/tools/product-checker"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            <Search className="size-4 text-primary" />
            <span>Scan Product by Link</span>
          </Link>
        </div>

        {/* Trust metrics */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 pt-8 border-t border-border/60">
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">4+</div>
            <div className="text-xs text-muted-foreground mt-1">Marketplaces in 1 Dashboard</div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">FIFO</div>
            <div className="text-xs text-muted-foreground mt-1">Batch-Accurate Net Profit</div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">AI 2.0</div>
            <div className="text-xs text-muted-foreground mt-1">Listing Optimization Engine</div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">4.9 ★</div>
            <div className="text-xs text-muted-foreground mt-1">Seller Satisfaction Rating</div>
          </div>
        </div>
      </section>

      {/* Free Interactive Tools */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Free Seller Tools
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Professional Calculators &amp; Product Scanners
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Accurately model product margins, marketplace fees, and inventory requirements before placing manufacturing orders.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/en/tools/product-checker"
              className="group rounded-2xl border border-border/80 bg-background/60 p-5 transition hover:border-primary/50 hover:bg-card hover:shadow-md"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Search className="size-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                <span>Product Scanner</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Paste any Uzum item link to get estimated sales revenue, order velocity, and listing audit score.
              </p>
            </Link>

            <Link
              href="/en/tools/commission-calculator"
              className="group rounded-2xl border border-border/80 bg-background/60 p-5 transition hover:border-primary/50 hover:bg-card hover:shadow-md"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <DollarSign className="size-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                <span>Commission Tool</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Calculate official marketplace commission tiers, logistics fulfillment, and net profit per unit.
              </p>
            </Link>

            <Link
              href="/kalkulyator/unit-iqtisodiyot"
              className="group rounded-2xl border border-border/80 bg-background/60 p-5 transition hover:border-primary/50 hover:bg-card hover:shadow-md"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <BarChart3 className="size-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                <span>Unit Economics</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Analyze break-even pricing, return-on-ad-spend (ROAS), and profit margin safety buffers.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="text-center sm:text-left mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Modules</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Everything Required to Scale Your Online Store
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/en/solutions/marketplace-analytics"
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg group"
          >
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <TrendingUp className="size-5" />
            </div>
            <h3 className="text-lg font-bold group-hover:text-primary transition">
              Marketplace Analytics
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Track multi-channel order volume, customer returns, revenue trends, and competitor price changes in real time.
            </p>
          </Link>

          <Link
            href="/en/solutions/inventory-management"
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg group"
          >
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Boxes className="size-5" />
            </div>
            <h3 className="text-lg font-bold group-hover:text-primary transition">
              Cloud Warehouse &amp; WMS
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Manage FBO warehouse supplies, batch barcode printing, and safety stock reorder point notifications.
            </p>
          </Link>

          <Link
            href="/en/solutions/ai-seo"
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg group"
          >
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="size-5" />
            </div>
            <h3 className="text-lg font-bold group-hover:text-primary transition">
              AI Listing SEO
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Generate optimized titles, keyword-rich bullet points, and descriptions that rank higher in search algorithms.
            </p>
          </Link>
        </div>
      </section>

      {/* Alternative to ZoomSelling */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Comparison</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Why Sellers Switch from ZoomSelling to eStats
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Modern architecture built for multi-marketplace sellers needing real ERP capabilities rather than simple data scrapers.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/en/alternatives/zoomselling"
              className="block rounded-2xl border border-border bg-background p-6 transition hover:border-primary"
            >
              <h3 className="font-bold text-foreground flex items-center justify-between">
                <span>Explore eStats vs ZoomSelling Feature Matrix</span>
                <ArrowRight className="size-4 text-primary" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Compare FIFO accounting, real-time Telegram sales alerts, multi-warehouse support, and multi-channel synchronization side by side.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="text-center sm:text-left mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">FAQ</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>{item.q}</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-14 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Scale Your E-Commerce Store with eStats
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base opacity-90 leading-relaxed">
            Connect your Uzum, Wildberries, Yandex Market, and Ozon accounts today and gain clear visibility over profits.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
