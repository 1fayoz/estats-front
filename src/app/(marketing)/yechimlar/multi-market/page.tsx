import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Globe, Layers, LayoutDashboard, ShieldCheck, Zap } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Multi-Marketplace Boshqaruv — Uzum, Yandex, WB va Ozon Yagona Paneli | eStats",
  description:
    "Bir nechta marketpleysda (Uzum Market, Yandex Market, Wildberries, Ozon) savdo qilyapsizmi? Har xil kabinetlarga kirib chiqishdan qutuling. eStats bilan barcha savdolar, qoldiqlar va moliya bitta ekranda.",
  keywords: [
    "multi marketplace uzbekistan",
    "barcha marketpleyslar bitta joyda",
    "uzum yandex integratsiya",
    "wildberries ozon boshqaruv dasturi",
    "marketpleys boshqaruv paneli",
    "ko'p bozorli savdo",
    "yagona kabinet marketplace",
  ],
  alternates: { canonical: "/yechimlar/multi-market" },
  openGraph: {
    title: "Multi-Marketplace Boshqaruv — Barcha bozorlar bitta oynada",
    description: "Uzum, Yandex Market, Wildberries va Ozon hisoblarini eStats orqali birlashtiring.",
    url: "https://estats.uz/yechimlar/multi-market",
  },
};

const FAQ_ITEMS = [
  {
    question: "Bir nechta marketpleys do'konlarini ulash mumkinmi?",
    answer:
      "Ha. eStats bir vaqtning o'zida Uzum Market, Yandex Market, Wildberries va Ozon bo'yicha bir nechta yuridik shaxslar va do'konlarni bitta kabinetga ulash imkonini beradi.",
  },
  {
    question: "Turli xil valyutalar qanday hisoblanadi?",
    answer:
      "eStats xalqaro savdolarni (Rubl, Dollar) avtomatik tarzda O'zbekiston Markaziy Banki kursi bo'yicha so'mga konvertatsiya qilib, umumiy konsolidatsiyalangan moliyaviy hisobotni beradi.",
  },
  {
    question: "Ombor qoldiqlari barcha bozorlar o'rtasida sinxronlashadimi?",
    answer:
      "Ha. Agar bitta tovaringiz ham Uzumda, ham Yandexda sotilayotgan bo'lsa, umumiy ombor zaxirasini markazlashtirilgan holda ko'rib turasiz.",
  },
];

export default function MultiMarketSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/multi-market" },
          { name: "Multi-Marketplace Boshqaruv", url: "/yechimlar/multi-market" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Globe className="size-3.5" /> Multi-Marketplace Ekosistemasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Barcha marketpleyslar <span className="text-primary">bitta boshqaruv panelida</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Uzum Market, Yandex Market, Wildberries va Ozon. 10 xil ilova va tablar o&apos;rtasida sarson bo&apos;lishni bas qiling.
          Barcha savdolar, qoldiqlar va umumiy sof foydani bitta ekranda nazorat qiling.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <LayoutDashboard className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Yagona boshqaruv paneli</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Har bir bozor bo&apos;yicha kunlik tushum, buyurtmalar soni va dinamika yagona toza grafikda namoyon bo&apos;ladi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Markaziy ombor</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tovarlaringiz turli bozorlarda qancha qolganini va qaysi platformada tezroq sotilayotganini solishtiring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Zap className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Konsolidatsiyalangan moliya</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Har xil valyutalar va komissiyalarni hisobga olgan holda butun biznesingizning umumiy sof daromadini ko&apos;ring.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kengayish (Masshtablash) osonlashadi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Yangi bozorlarga (Yandex, WB, Ozon) tez va qo'rquvsiz kirish",
            "Barcha do'konlarning xarajatlari va P&L hisobotini bir joyda jamlash",
            "Jamoangiz va menejerlaringiz uchun bitta xavfsiz ish muhiti",
            "Ortiqcha vaqt yo'qotish va inson omili xatolarini minimallashtirish",
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
        <h3 className="text-2xl font-bold">Biznesingizni ko&apos;p bozorli darajaga ko&apos;taring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali barcha marketpleyslardagi do&apos;konlaringizni bitta professional tizimda birlashtiring.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Do&apos;konlarni ulash <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
