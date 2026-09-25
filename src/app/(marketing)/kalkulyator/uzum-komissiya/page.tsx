import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Check, HelpCircle, ShieldCheck } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { UzumCommissionCalculator } from "@/features/calculators/uzum-commission-calculator";

export const metadata: Metadata = {
  title: "Uzum Market Komissiya Kalkulyatori (2026) — Sof Foyda va Xarajatlarni Bepul Hisoblash | eStats",
  description:
    "Uzum Market'da sotayotgan tovaringiz bo'yicha komissiya, logistika, tan narx va qo'lingizda qoladigan sof foydani onlayn bepul hisoblang. Toifalar bo'yicha amaldagi foiz stavkalari.",
  keywords: [
    "uzum komissiyasi kalkulyator",
    "uzum komissiya hisoblash",
    "uzum foizlari 2026",
    "uzum foyda kalkulyatori",
    "uzum kuryerlik tolovi",
    "marketpleys tan narx hisoblash",
    "uzumda qancha foyda qoladi",
    "uzum kalkulyator",
  ],
  alternates: { canonical: "/kalkulyator/uzum-komissiya" },
  openGraph: {
    title: "Uzum Market Komissiya Kalkulyatori — Bepul Onlayn Hisoblagich",
    description: "Uzum komissiyasi va barcha xarajatlarni hisobga olgan holda toza foydangizni biling.",
    url: "https://estats.uz/kalkulyator/uzum-komissiya",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Market komissiyasi qancha?",
    answer:
      "Uzum Market komissiyasi tovar toifasiga qarab odatda 3% dan 25% gacha bo'ladi. Masalan, maishiy texnika va elektronika uchun 5-10%, kiyim-kechak, poyabzal va aksessuarlar uchun 15-20% atrofida belgilanadi.",
  },
  {
    question: "Logistika to'lovi nimaga bog'liq?",
    answer:
      "Logistika va kuryerlik to'lovlari tovarning o'lchami, og'irligi hamda buyurtma berilgan viloyatga yetkazib berish xizmatiga qarab o'zgaradi.",
  },
  {
    question: "Barcha tovarlarimni qo'lda kiritmasdan avtomatik hisoblash mumkinmi?",
    answer:
      "Ha! eStats platformasiga Uzum do'koningizni ulasangiz, tizim barcha SKU tovarlaringizning komissiyalarini avtomatik tortib, FIFO tan narx asosida sof foydangizni har kuni hisoblab boradi.",
  },
];

export default function UzumCommissionCalculatorPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "Uzum komissiya kalkulyatori", url: "/kalkulyator/uzum-komissiya" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Calculator className="size-3.5" /> Bepul Onlayn Vosita
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">komissiya va foyda kalkulyatori</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tovaringiz sotilganda Uzum qancha komissiya ushlab qoladi va cho&apos;ntagingizda qancha sof foyda qoladi?
          Barchasini bir necha soniyada hisoblang.
        </p>
      </header>

      {/* Interaktiv kalkulyator */}
      <UzumCommissionCalculator />

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kalkulyator nimani hisobga oladi?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Kategoriya bo'yicha rasmiy foiz stavkalari",
            "Ombor va xaridorga yetkazib berish (logistika) to'lovlari",
            "Tovarning partiya bo'yicha sotib olish narxi (Tan narx)",
            "Qadoqlash, etiketka va boshqa operatsion xarajatlar",
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
        <h3 className="text-2xl font-bold">Har bir tovaringizni avtomatik hisoblang</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Qo&apos;lda hisoblashdan charchadingizmi? eStats do&apos;koningizni ulab, real vaqt rejimida barcha tovarlar
          foydasi va marjasini nazorat qiling.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats&apos;ni bepul boshlash <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
