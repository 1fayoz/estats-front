import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BreadcrumbSchema, FaqSchema, HowToSchema } from "@/components/seo/structured-data";
import { BarcodeGeneratorTool } from "@/components/barcode-generator-tool";

export const metadata: Metadata = {
  title: "Free Barcode & Thermal Label Generator (58x40, 43x25 mm) | eStats",
  description:
    "Generate scannable Code-128 and EAN-13 barcodes and print standard 58x40 mm thermal stickers for marketplace sellers online.",
  keywords: [
    "barcode generator thermal printer",
    "58x40 mm label generator",
    "free code 128 barcode generator",
    "marketplace product labeling software",
    "uzum market barcode print",
    "wildberries thermal label generator",
  ],
  alternates: {
    canonical: "/en/tools/barcode-generator",
    languages: {
      uz: "/kalkulyator/shtrix-kod",
      ru: "/ru/kalkulyator/shtrix-kod",
      en: "/en/tools/barcode-generator",
    },
  },
  openGraph: {
    title: "Free Barcode & Thermal Label Generator — eStats",
    description: "Instant 58x40 mm sticker and barcode generation for e-commerce sellers.",
    url: "https://estats.uz/en/tools/barcode-generator",
  },
};

const FAQ_ITEMS = [
  {
    question: "What is the standard label dimension for Central Asian marketplaces?",
    answer:
      "The dominant industry standard across regional fulfillment centers (Uzum Market, Wildberries, Ozon) is 58×40 mm thermal labels.",
  },
  {
    question: "Which barcode symbologies are supported?",
    answer:
      "Our generator outputs Code-128 and EAN-13 barcodes with crisp vector rendering suitable for high-speed laser and optical scanners.",
  },
  {
    question: "Can I print directly to a thermal printer without specialized software?",
    answer:
      "Yes. The print output is styled with dedicated zero-margin CSS that feeds directly to thermal roll printers like Xprinter, TSC, or Zebra.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "Enter Product Details",
    text: "Fill in product name, SKU, and barcode number (or generate a fresh EAN-13).",
  },
  {
    name: "Select Label Preset",
    text: "Pick the standard 58×40 mm or small 43×25 mm sticker template.",
  },
  {
    name: "Print",
    text: "Set desired quantity and print directly using browser print dialog.",
  },
];

export default function EnglishBarcodePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/en" },
          { name: "Tools", url: "/en/tools/product-checker" },
          { name: "Barcode Generator", url: "/en/tools/barcode-generator" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />
      <HowToSchema
        name="How to Generate and Print Barcode Labels for Marketplaces"
        description="Step-by-step guide to printing thermal barcode stickers online"
        steps={HOW_TO_STEPS}
      />

      <BarcodeGeneratorTool locale="en" />

      {/* SEO Section */}
      <section className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          E-Commerce Product Labeling &amp; Barcode Compliance
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Correct product barcoding ensures swift intake at FBO fulfillment centers and eliminates misidentified stock.
            With the eStats Online Barcode Generator, sellers can generate standardized thermal labels on the fly without costly graphic design tools.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Automate Your Entire Marketplace Inventory
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xl">
              eStats unifies inventory batches, FIFO cost of goods, and multi-channel order synchronization in one place.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
