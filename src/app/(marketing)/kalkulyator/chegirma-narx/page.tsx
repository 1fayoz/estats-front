import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Percent, Sparkles, Tag } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { DiscountPricingCalculator } from "@/features/calculators/discount-pricing-calculator";

export const metadata: Metadata = {
  title: "Chegirma va Narx Qo'yish Kalkulyatori — Uzum Marketda Narx Belgilash Strategiyasi | eStats",
  description:
    "Uzum Marketda tovaringizga qancha chegirma ko'rsatishdan qat'i nazar, mo'ljallangan sof foydada qolish uchun asl narx (chizilgan narx) va haqiqiy sotuv narxini bepul hisoblang.",
  keywords: [
    "chegirma kalkulyatori uzum",
    "narx qoyish kalkulyatori",
    "uzum eski narx hisoblash",
    "chizilgan narx strategiyasi",
    "markup marja hisoblagich",
    "uzumda tovar narxi qoyish",
    "marketpleys narx strategiyasi",
  ],
  alternates: { canonical: "/kalkulyator/chegirma-narx" },
  openGraph: {
    title: "Chegirma va Narx Belgilash Kalkulyatori — eStats Bepul Vosita",
    description: "Katta chegirma e'lon qilib ham doim sof foydada qoling.",
    url: "https://estats.uz/kalkulyator/chegirma-narx",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Marketda sun'iy katta chegirma ko'rsatish qanday ishlaydi?",
    answer:
      "Xaridorlar katta qizil chegirmali (-40%, -50%) tovarlarni ancha ishonchli va manfaatli deb bilishadi. Siz tovarning chizilgan asl narxini yuqoriroq belgilab, amaldagi sotuv narxiga kerakli marjangizni kiritasiz. Shunda xaridor katta chegirma ko'radi, siz esa to'liq rejalashtirilgan foydangizni olasiz.",
  },
  {
    question: "Chegirma hisoblashda qanday xatolarga yo'l qo'ymaslik kerak?",
    answer:
      "Eng ko'p uchraydigan xato — bozor komissiyasini esdan chiqarish. Uzum komissiyani chegirmadagi haqiqiy sotuv narxidan yechadi. Kalkulyatorimiz komissiya va logistikani oldindan hisoblab, toza foydani kafolatlaydi.",
  },
];

export default function DiscountPricingCalculatorPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/chegirma-narx" },
          { name: "Chegirma va narx kalkulyatori", url: "/kalkulyator/chegirma-narx" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Tag className="size-3.5" /> Narx Strategiyasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">chegirma va narx kalkulyatori</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Katta qizil chegirma e&apos;lon qiling, ko&apos;proq xaridorlarni jalb qiling va har doim o&apos;zingiz xohlagan
          sof foydani oling.
        </p>
      </header>

      <DiscountPricingCalculator />

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">To&apos;g&apos;ri narx belgilash qoidalari</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Eski narx va haqiqiy narx o'rtasidagi chegirma kamida 25-45% ko'rinishi maqsadga muvofiq",
            "Bozor komissiyasi doim amaldagi chekdan yechilishini unutmang",
            "Raqobatchilar narxidan keskin qimmat bo'lmasligi uchun bozor tahlilini qiling",
            "Aksiyalar va mavsumiy chegirmalar uchun oldindan marja zaxirasi qoldiring",
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
        <h3 className="text-2xl font-bold">Narxlaringiz har doim daromad keltirsin</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali narxlaringiz raqobatchilarga nisbatan qanday o&apos;zgarayotganini avtomatik kuzating.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats&apos;dan bepul foydalanish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
