import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Search, Sparkles } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Atamalari Lug'ati (Glossary) — FIFO, DRR, FBO, FBS, ROI, SKU | eStats",
  description:
    "Marketpleys sotuvchilari uchun to'liq atamalar lug'ati. FIFO, FBO, FBS, DRR, ACoS, ROAS, SKU, Out of Stock, Rich Content, Unit Economics atamalarining oddiy tildagi tushuntirishi.",
  keywords: [
    "marketpleys lug'at",
    "fifo nima",
    "fbo va fbs farqi",
    "drr nima",
    "sku nima",
    "out of stock nima",
    "rich content uzum",
    "unit economics nima",
    "marja va roi farqi",
    "uzum atamalari",
  ],
  alternates: { canonical: "/lugat" },
  openGraph: {
    title: "Marketpleys Atamalari Lug'ati — eStats Boshlang'ich va Professional Qo'llanma",
    description: "Elektron tijorat va marketpleys terminlarining to'liq ensiklopediyasi.",
    url: "https://estats.uz/lugat",
  },
};

const GLOSSARY_TERMS = [
  {
    term: "FIFO (First-In, First-Out)",
    category: "Moliya & Ombor",
    definition:
      "Buxgalteriya va ombor hisobi usuli. Birinchi kirim qilingan tovar partiyasi birinchi sotilgan deb hisoblanadi. Bu tovar tannarxining sun'iy o'zgarib ketmasligini ta'minlaydi va sof foydani 100% aniqlikda hisoblashga imkon beradi.",
  },
  {
    term: "FBO (Fulfillment by Operator)",
    category: "Logistika",
    definition:
      "Tovarlarni to'liq marketpleys omborida (masalan, Uzum Market yoki Wildberries omborida) saqlash va buyurtma tushganda marketpleysning o'zi qadoqlab xaridorga yetkazib berish modeli.",
  },
  {
    term: "FBS (Fulfillment by Seller)",
    category: "Logistika",
    definition:
      "Tovarlarni sotuvchi o'z omborida saqlaydi va buyurtma tushgandan so'ng qadoqlab, marketpleysning saralash markaziga (sortirovochniy sentr) topshiradi.",
  },
  {
    term: "DRR (Доля рекламных расходов / ACoS)",
    category: "Marketing",
    definition:
      "Reklama xarajatlarining reklama orqali olingan umumiy savdo tushumidagi foiz ulushi. Formula: (Reklama xarajati / Savdo tushumi) * 100%. DRR qancha past bo'lsa, reklama shuncha samarali bo'ladi.",
  },
  {
    term: "ROAS (Return on Ad Spend)",
    category: "Marketing",
    definition:
      "Reklamaga kiritilgan har 1 so'm investitsiyaning necha barobar savdo keltirganini ko'rsatuvchi koeffitsiyent. Formula: Savdo tushumi / Reklama xarajati.",
  },
  {
    term: "SKU (Stock Keeping Unit)",
    category: "Ombor",
    definition:
      "Ombordagi har bir alohida tovar variatsiyasining (masalan, o'lchami, rangi, hajmi bo'yicha) unikal identifikator kodi.",
  },
  {
    term: "Out of Stock (OOS)",
    category: "Ombor",
    definition:
      "Tovarning omborda to'liq tugab qolishi. Bu holat marketpleys algoritmlarida tovar kartochkasi reytingining keskin tushib ketishiga sabab bo'ladi.",
  },
  {
    term: "Unit Economics (Unit iqtisodiyoti)",
    category: "Moliya",
    definition:
      "1 dona tovar birligi bo'yicha barcha daromad va o'zgaruvchan xarajatlar (tannarx, soliq, komissiya, logistika, reklama) tahlili va uning sof marjasi.",
  },
  {
    term: "Rich Content (Boyitilgan kontent)",
    category: "Tovar SEO",
    definition:
      "Tovar tavsifida oddiy matndan tashqari rasmlar, infografikalar, jadvallar va vizual bloklardan foydalanish. Bu xaridor ishonchini oshirib, konversiyani sezilarli darajada ko'taradi.",
  },
  {
    term: "CTR (Click-Through Rate)",
    category: "Marketing",
    definition:
      "Tovarning qidiruvda ko'rsatilishidan bosilishgacha bo'lgan foiz nisbati. Formula: (Bosishlar soni / Ko'rishlar soni) * 100%. Asosiy rasm (glavniy foto) va narx CTR ga bevosita ta'sir qiladi.",
  },
];

export default function GlossaryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Bilimlar bazasi", url: "/lugat" },
          { name: "Marketpleys atamalari lug'ati", url: "/lugat" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" /> Ensiklopediya va Lug&apos;at
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleys atamalari <span className="text-primary">to&apos;liq lug&apos;ati</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Elektron tijoratda tez-tez uchraydigan terminlar, qisqartmalar va formulalarning tushunarli ta&apos;riflari.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {GLOSSARY_TERMS.map((item) => (
          <div key={item.term} className="rounded-2xl border bg-card p-6 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-foreground">{item.term}</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {item.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.definition}</p>
          </div>
        ))}
      </div>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Nazariyani amaliyotga aylantiring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats platformasi barcha ushbu ko&apos;rsatkichlarni (FIFO, DRR, Unit Economics) avtomatik hisoblab beradi.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats&apos;ni bepul sinab ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
