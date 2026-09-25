import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, FileText, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { BreadcrumbSchema, HowToSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "How to Sell on Uzum Market in 2026: Complete Seller Guide | eStats",
  description:
    "Comprehensive step-by-step tutorial on starting a business on Uzum Market in Uzbekistan: business registration, contracts, barcode labeling, product listings, and first warehouse delivery.",
  keywords: [
    "how to sell on uzum market",
    "uzum market seller onboarding",
    "sell in uzbekistan e-commerce",
    "uzum market fees and requirements",
    "fbo delivery uzum fulfillment",
  ],
  alternates: {
    canonical: "/en/guides/how-to-sell-on-uzum-market",
    languages: {
      uz: "/qollanma/uzumda-dokon-ochish",
      ru: "/ru/qollanma/uzumda-dokon-ochish",
      en: "/en/guides/how-to-sell-on-uzum-market",
    },
  },
  openGraph: {
    title: "How to Start Selling on Uzum Market (2026 Seller Guide) — eStats",
    description: "Launch your marketplace store in Uzbekistan with this comprehensive walkthrough.",
    url: "https://estats.uz/en/guides/how-to-sell-on-uzum-market",
    images: ["https://estats.uz/api/og?title=How+to+Sell+on+Uzum+Market+2026&badge=eStats+Guide"],
  },
};

export default function EnOpenShopGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Guides", url: "/en/guides" },
          { name: "How to sell on Uzum Market", url: "/en/guides/how-to-sell-on-uzum-market" },
        ]}
      />
      <HowToSchema
        name="How to register and launch sales on Uzum Market"
        description="A 4-step comprehensive roadmap to start selling on Uzum Market in Uzbekistan."
        steps={[
          {
            name: "Form a Legal Entity (Individual Entrepreneur or LLC)",
            text: "Register an entity in Uzbekistan, obtain electronic digital signature (EDS), and open a local bank settlement account.",
          },
          {
            name: "Register on Uzum Seller Portal",
            text: "Complete onboarding documentation, digitally sign seller agreement, and configure your merchant profile.",
          },
          {
            name: "Analyze Market Niches & Prepare Products",
            text: "Use eStats market intelligence to identify low-competition niches, verify unit economics, and inspect product margins.",
          },
          {
            name: "Generate Barcodes and Deliver to Fulfillment Center",
            text: "Print 58x40 mm thermal barcodes with eStats free tools, compile handover manifest, and deliver goods to the central warehouse.",
          },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Rocket className="size-3.5" /> Seller Onboarding Playbook
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          How to Start Selling on Uzum Market in 2026
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground leading-relaxed">
          Uzum Market is Central Asia's fastest-growing national marketplace, processing over 100,000 daily orders with guaranteed 1-day delivery across Uzbekistan. Here is your definitive blueprint to launching a profitable store.
        </p>
      </header>

      {/* Steps */}
      <section className="space-y-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
              1
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Establish Legal Status &amp; Bank Account
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To register on Uzum Market, you must operate as a registered individual entrepreneur (YaTT) or legal entity (LLC / MChJ) within Uzbekistan. Foreign companies can partner with local distributors or establish local subsidiaries.
          </p>
          <ul className="space-y-2 text-xs text-foreground">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-emerald-500" /> State registration certificate (Guvohnoma)
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-emerald-500" /> Commercial bank settlement account
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-emerald-500" /> Electronic Digital Signature (EDS / E-Imzo)
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
              2
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Register on the Uzum Seller Portal
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Navigate to the official merchant onboarding portal, input your tax identification number (STIR / INN), upload required business documents, and digitally execute the public offer agreement. Approval typically completes within 24 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
              3
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Market Intelligence &amp; Product Sourcing
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Prior to shipping inventory, calculate unit economics and ensure product margins absorb marketplace commissions (15-25%) and advertising costs.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/en/tools/commission-calculator"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Commission Calculator <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/en/tools/abc-analysis"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              ABC Inventory Tool <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
              4
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Print Barcodes &amp; Deliver to Warehouse
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every product unit requires a scannable 58x40 mm thermal barcode sticker. Use our free vector barcode generator to produce labels compatible with Uzum and Wildberries fulfillment standards.
          </p>
          <Link
            href="/en/tools/barcode-generator"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
          >
            Launch Barcode Generator <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA Box */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Scale Faster with eStats ERP
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Automate batch FIFO inventory costs, multi-channel stock sync, and AI product optimization across Central Asian marketplaces.
          </p>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground text-xs shadow hover:opacity-90 transition whitespace-nowrap"
        >
          Get Started with eStats
        </Link>
      </div>
    </article>
  );
}
