import type { Metadata } from "next";
import { PublicProductScanner } from "@/features/scanner/public-product-scanner";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Product Scanner — Instant Sales & Revenue Estimator | eStats",
  description:
    "Free Uzum Market product scanner: estimate monthly unit sales, revenue, average customer rating, and listing SEO optimization score in real time.",
  keywords: [
    "uzum market product scanner",
    "uzum product sales estimator",
    "uzbekistan marketplace spy tool",
    "uzum seller analytics",
    "ecommerce product research uzbekistan",
  ],
  alternates: {
    canonical: "/en/tools/product-checker",
    languages: {
      uz: "/tekshirish",
      ru: "/ru/tekshirish",
      en: "/en/tools/product-checker",
      "x-default": "/tekshirish",
    },
  },
  openGraph: {
    title: "Uzum Market Product Scanner — Sales & Revenue Estimator",
    description: "Inspect any Uzum Market item URL to evaluate revenue, units sold, and listing SEO.",
    url: "https://estats.uz/en/tools/product-checker",
    locale: "en_US",
  },
};

export default function EnglishProductCheckerPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-10">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Tools", url: "/en" },
          { name: "Product Scanner", url: "/en/tools/product-checker" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Product Scanner</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Instantly evaluate any listing on Uzbekistan&apos;s leading e-commerce platform before allocating capital or placing stock orders.
        </p>
      </header>

      <PublicProductScanner locale="en" />

      <section className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">How does the estimator work?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our algorithm continuously samples public listing activity, inventory replenishment frequencies, and buyer review velocity to derive accurate sales volume estimates.
        </p>
      </section>
    </div>
  );
}
