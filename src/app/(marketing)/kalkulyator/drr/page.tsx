import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Megaphone, Target } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { DrrCalculator } from "@/features/calculators/drr-calculator";

export const metadata: Metadata = {
  title: "DRR va ROAS Kalkulyatori — Uzum Boost TOP va Reklama Samaradorligini Hisoblash | eStats",
  description:
    "Uzum Market Boost TOP va boshqa reklamalaringizning DRR (Доля рекламных расходов) va ROAS ko'rsatkichlarini onlayn hisoblang. Reklama foyda keltiryaptimi yoki zararga ishlayaptimi, darhol aniqlang.",
  keywords: [
    "drr kalkulyator",
    "drr hisoblash",
    "roas hisoblagich",
    "uzum reklama tahlili",
    "boost top samaradorligi",
    "reklama rentabelligi uzum",
    "acos drr farqi",
  ],
  alternates: { canonical: "/kalkulyator/drr" },
  openGraph: {
    title: "DRR va Reklama Rentabelligi Kalkulyatori — eStats",
    description: "Reklamangiz har bir sarflangan so'mga qancha savdo keltirayotganini aniqlang.",
    url: "https://estats.uz/kalkulyator/drr",
  },
};

const FAQ_ITEMS = [
  {
    question: "DRR nima va u qanday formula bilan hisoblanadi?",
    answer:
      "DRR (Доля рекламных расходов) = (Reklamaga sarflangan pul / Reklama orqali qilingan savdo tushumi) * 100%. Masalan, 1 mln so'm reklama sarflab 10 mln so'mlik tovar sotgan bo'lsangiz, DRR = 10% bo'ladi.",
  },
  {
    question: "ROAS nima?",
    answer:
      "ROAS (Return on Ad Spend) — bu sarflangan har 1 so'm reklama qancha savdo qaytarganini ko'rsatadi. Formula: Savdo tushumi / Reklama xarajati. Masalan, 10 mln / 1 mln = 10x ROAS.",
  },
  {
    question: "Optimal DRR necha foiz bo'lishi kerak?",
    answer:
      "DRR har doim tovaringizning marjasidan past bo'lishi shart. Agar tovar marjasi 25% bo'lsa, sizning DRR ko'rsatkichingiz 15-20% dan oshmasligi kerak. Aks holda reklama foydani yeb qo'yadi.",
  },
];

export default function DrrCalculatorPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/drr" },
          { name: "DRR va Reklama kalkulyatori", url: "/kalkulyator/drr" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Megaphone className="size-3.5" /> Bepul Reklama Vosita
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">DRR va reklama kalkulyatori</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Uzum Boost TOP reklamalaringiz qanchalik samarali ekanini, qaysi kampaniyalar foyda, qaysilari
          zarar keltirayotganini darhol bilib oling.
        </p>
      </header>

      <DrrCalculator />

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Reklama nazorati nima uchun zarur?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Ko'p sotuvchilar reklama orqali katta aylanma qilib, aslida minusga kirib qolishadi",
            "DRR nazorati samarasiz kalit so'zlar va kampaniyalarni darhol to'xtatishga yordam beradi",
            "Maksimal foyda keltirayotgan tovarlarga budjetni qayta yo'naltirish imkoniyati",
            "Har bir sarflangan so'mning real ROI va daromadga ta'sirini ko'rish",
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
        <h3 className="text-2xl font-bold">Reklamalaringizni avtomatik audit qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats platformasi barcha Boost TOP kampaniyalaringizni har kuni skanerlab, zararli reklamalardan ogohlantiradi.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats orqali tekshirish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
