import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Globe, Layers, ShieldCheck, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Ozon O'zbekiston Analitika va Savdo Boshqaruvi — Sellers Uchun | eStats",
  description:
    "Ozon Uzbekistan sotuvchilari uchun to'liq analitika platformasi: O'zbekistondan turib Ozon orqali savdo qilish, komissiyalar, valyuta konvertatsiyasi, ombor va sof foyda hisobi.",
  keywords: [
    "ozon uzbekistan analitika",
    "ozon seller uzbekistan",
    "ozonda savdo qilish uzbekistan",
    "ozon komissiyasi hisoblash",
    "ozon fbs uzbekistan",
  ],
  alternates: { canonical: "/bozorlar/ozon" },
  openGraph: {
    title: "Ozon O'zbekiston Analitika Tizimi — eStats",
    description: "Ozon bozoridagi tovarlaringiz va buyurtmalaringizni to'liq nazorat qiling.",
    url: "https://estats.uz/bozorlar/ozon",
  },
};

const FAQ_ITEMS = [
  {
    question: "O'zbekistondan Ozon orqali qanday tovarlarni sotish mumkin?",
    answer:
      "To'qimachilik, kiyim-kechak, quritilgan mevalar, uy-ro'zg'or buyumlari va milliy mahsulotlar Ozon orqali Rossiya va butun MDH xaridorlariga juda yaxshi sotilmoqda.",
  },
  {
    question: "eStats Ozon hisobotlarini so'mga aylantiradimi?",
    answer:
      "Ha. Barcha chet el valyutalaridagi sotuvlar va xarajatlar O'zbekiston so'miga avtomatik konvertatsiya qilinadi.",
  },
];

export default function OzonMarketPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Bozorlar", url: "/bozorlar/ozon" },
          { name: "Ozon O'zbekiston", url: "/bozorlar/ozon" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Globe className="size-3.5" /> Xalqaro Eksport
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Ozon O&apos;zbekiston uchun <span className="text-primary">zamonaviy analitika va moliya</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O&apos;zbekistondan turib millionlab yangi xaridorlarga chiqing.
          Ozon komissiyalari, valyuta kurslari, logistika va haqiqiy sof foyda hisobi bitta tizimda.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <TrendingUp className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Xalqaro savdolar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rossiya, Belarus va Qozog&apos;iston bozorlariga O&apos;zbekiston tovarlarini eksport qilish tahlili.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Multi-Market ombor</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uzum, Wildberries va Ozon tovarlarini bitta markaziy ombor orqali sinxron boshqaring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <ShieldCheck className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">So&apos;mdagi P&L hisoboti</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Valyuta tebranishlarini inobatga olgan holda aniq buxgalteriya darajasidagi foyda/zarar hisobi.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Ozon sotuvchisi uchun asosiy qulayliklar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "O'zbekistondagi omborlardan FBS jo'natmalarini hisobga olish",
            "Barcha marketpleyslar hisobotini yagona ekranda jamlash",
            "Raqobatchilar baholari va Ozon aksiyalarini kuzatib borish",
            "Menejerlar va jamoangiz uchun xavfsiz ko'p foydalanuvchili kirish",
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
        <h3 className="text-2xl font-bold">Ozon do&apos;koningizni tizimga ulang</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats platformasi orqali savdolaringizni yangi xalqaro darajaga ko&apos;taring.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Hisobga kirish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
