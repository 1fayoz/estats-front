import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, DollarSign, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { UnitEconomicsCalculator } from "@/features/calculators/unit-economics-calculator";

export const metadata: Metadata = {
  title: "Unit Iqtisodiyoti (Unit Economics) Kalkulyatori — Tovar Marjasi, ROI va Zararsizlik | eStats",
  description:
    "Marketpleysda tovar sotishdan oldin unit iqtisodiyotini onlayn bepul hisoblang. 1 dona tovarning sof marjasi, ROI ko'rsatkichi, soliqlar, reklama ulushi va minimal sotuv narxi (Break-even).",
  keywords: [
    "unit iqtisodiyoti kalkulyator",
    "unit economics uzbekistan",
    "marja hisoblash kalkulyator",
    "roi hisoblagich tovar",
    "zararsizlik nuqtasi marketpleys",
    "breakeven narx hisoblash",
    "uzum foyda marjasi",
  ],
  alternates: { canonical: "/kalkulyator/unit-iqtisodiyot" },
  openGraph: {
    title: "Unit Iqtisodiyoti Kalkulyatori — Tovar foydasini professional hisoblang",
    description: "1 dona tovardan qancha foyda qolishi va minimal sotuv narxini aniqlang.",
    url: "https://estats.uz/kalkulyator/unit-iqtisodiyot",
  },
};

const FAQ_ITEMS = [
  {
    question: "Unit iqtisodiyoti nima va u nega sotuvchiga kerak?",
    answer:
      "Unit iqtisodiyoti — bu bitta dona tovar (unit) darajasidagi daromad va xarajatlar tahlili. U tovarning haqiqiy marjinalligini, barcha bilvosita to'lovlar (komissiya, soliq, logistika, reklama) chegirilgandan so'ng biznesga foyda keltirishini ko'rsatib beradi.",
  },
  {
    question: "Zararsizlik narxi (Break-even price) nimani anglatadi?",
    answer:
      "Bu tovarning barcha xarajatlarini qoplaydigan, lekin 0 so'm foyda qoldiradigan minimal narxi. Agar tovaringizni ushbu narxdan pastroq sotsangiz, har bir savdodan to'g'ridan-to'g'ri zarar ko'rasiz.",
  },
  {
    question: "Uzum va boshqa bozorlarda qanday marja yaxshi hisoblanadi?",
    answer:
      "Odatda marketpleyslarda sof marja 15% dan 30% gacha bo'lishi sog'lom biznes ko'rsatkichi sanaladi. Agar marja 10% dan past bo'lsa, kutilmagan qaytishlar yoki reklama narxi oshishi do'konni minusga tushirishi mumkin.",
  },
];

export default function UnitEconomicsCalculatorPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/unit-iqtisodiyot" },
          { name: "Unit iqtisodiyoti kalkulyatori", url: "/kalkulyator/unit-iqtisodiyot" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <TrendingUp className="size-3.5" /> Bepul Moliya Vosita
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">unit iqtisodiyoti kalkulyatori</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Har bir tovaringiz qanchalik daromadli ekanini va qaysi narxda sotsangiz zararga kirmasligingizni
          hisoblab chiqing.
        </p>
      </header>

      <UnitEconomicsCalculator />

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Qanday xarajatlarni bilish shart?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "COGS (Tovarning sotib olish yoki ishlab chiqarish tannarxi)",
            "Marketpleys to'lovlari (Komissiya, saqlash, yetkazish)",
            "1 dona tovar xaridiga to'g'ri keluvchi reklama sarfi (CAC)",
            "Aylanma solig'i yoki daromad solig'i stavkasi",
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
        <h3 className="text-2xl font-bold">Har bir tovar foydali bo&apos;lsin</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali barcha tovarlaringizning haqiqiy marjasini va PnL hisobotini real vaqtda kuzating.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats&apos;ga ulanish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
