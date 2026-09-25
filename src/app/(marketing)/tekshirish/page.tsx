import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Check, Search, ShieldCheck, Sparkles } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { PublicProductScanner } from "@/features/scanner/public-product-scanner";

export const metadata: Metadata = {
  title: "Uzum Tovarini Tekshirish — Havola Orqali Sotuvlar va Qoldiqlarni Bepul Aniqlash | eStats",
  description:
    "Istalgan Uzum Market tovar havolasini (linkini) yoki ID sini kiriting. Tovarning taxminiy oylik savdosi, aylanmasi, narx reytingi va SEO auditini onlayn bepul ko'ring.",
  keywords: [
    "uzum tovar tekshirish",
    "uzum tovar sotuvini korish",
    "uzum raqobatchi tovar tahlili",
    "uzum link tekshirish",
    "tovar oylik aylanmasi uzum",
    "uzum tovar skaner",
    "bepul tovar tahlili",
  ],
  alternates: { canonical: "/tekshirish" },
  openGraph: {
    title: "Uzum Tovarini Tekshirish — eStats Tezkor Skaner",
    description: "Uzum tovar havolasini kiriting va uning barcha sirlarini bilib oling.",
    url: "https://estats.uz/tekshirish",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum tovar havolasi orqali nimalarni aniqlash mumkin?",
    answer:
      "Tovarning oxirgi 30 kundagi taxminiy sotuvlar soni, oylik savdo tushumi, xaridorlar sharhlari va reytingi, shuningdek uning nom va tavsifidagi SEO xatolari hamda AI optimizatsiya tavsiyalarini ko'rishingiz mumkin.",
  },
  {
    question: "Ushbu skanerdan foydalanish bepulmi?",
    answer:
      "Ha, tezkor tovar tekshirish vositasi barcha foydalanuvchilar uchun mutlaqo ochiq va bepul.",
  },
  {
    question: "Raqobatchining aniq kunlik qoldiqlarini qanday ko'rish mumkin?",
    answer:
      "eStats Lens Chrome kengaytmasi orqali to'g'ridan-to'g'ri Uzum Market veb-saytida har bir tovarning qoldiqlar grafigini va narx o'zgarishlari tarixini real vaqtda ko'rib turishingiz mumkin.",
  },
];

export default function ProductScannerPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Vositalar", url: "/tekshirish" },
          { name: "Uzum tovarini tekshirish", url: "/tekshirish" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Search className="size-3.5" /> Bepul Tovar Razvedkasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum tovarini <span className="text-primary">havola orqali tezkor tekshiring</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Raqobatchingiz qancha sotayotganini va tovarning haqiqiy talabini bilmoqchimisiz?
          Tovar linkini kiriting va darhol to&apos;liq tahlilga ega bo&apos;ling.
        </p>
      </header>

      {/* Interaktiv skaner */}
      <PublicProductScanner />

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Skaner nimani tekshiradi?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Oylik o'rtacha savdolar hajmi va aylanma summasi",
            "Sharhlar soni va xaridorlar qoniqish darajasi (Reyting)",
            "Tovar nomida kerakli kalit so'zlarning borligi",
            "Konversiyani oshiruvchi sun'iy intellekt (AI) maslahatlari",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Check className="size-3.5" />
              </div>
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Ko&apos;p beriladigan savollar</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="rounded-2xl border bg-card p-4 sm:p-5">
              <summary className="font-semibold cursor-pointer text-foreground">{item.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Butun bozor tovarlarini ommaviy tahlil qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bozor razvedkasi orqali barcha nishalardagi yuz minglab tovarlarni saralashingiz mumkin.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Bozor tahlilini ochish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
