import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Baby, Check, Flame, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Bolalar Tovarlari Tahlili — O'yinchoqlar, Gigiyena va Kiyimlar | eStats",
  description:
    "Uzum Market'dagi bolalar tovarlari, o'yinchoqlar, pamperslar, yangi tug'ilgan chaqaloqlar parvarishi va bolalar kiyimlari toifasi tahlili: o'rtacha aylanma, eng ko'p sotilayotgan tovarlar.",
  keywords: [
    "uzum bolalar tovarlari tahlili",
    "oyinchoqlar sotuvlari uzum",
    "pamperslar aylanmasi uzum",
    "chaqaloqlar tovarlari uzum",
    "bolalar tovarlari nishalari",
  ],
  alternates: { canonical: "/kategoriya/bolalar-tovarlari" },
  openGraph: {
    title: "Bolalar Tovarlari Bozor Tahlili — Uzum Market | eStats",
    description: "Bolalar tovarlari toifasidagi eng talabgir nishalar va oylik daromad.",
    url: "https://estats.uz/kategoriya/bolalar-tovarlari",
  },
};

const FAQ_ITEMS = [
  {
    question: "Bolalar toifasida eng xaridorgir yo'nalish qaysi?",
    answer:
      "Rivojlantiruvchi o'yinchoqlar (Montessori, konstruktorlar), tagliklar (podguzniklar) va mavsumiy qulay bolalar trikotaj kiyimlari eng katta aylanmaga ega.",
  },
  {
    question: "Onalar xarid qilayotganda nimalarga e'tibor berishadi?",
    answer:
      "Tarkibning xavfsizligi (100% paxta, gipoallergen, hidsiz plastik) va xaridorlarning ijobiy sharhlari eng asosiy qaror omili hisoblanadi.",
  },
];

export default function KidsCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kategoriyalar", url: "/kategoriya/bolalar-tovarlari" },
          { name: "Bolalar Tovarlari", url: "/kategoriya/bolalar-tovarlari" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Baby className="size-3.5" /> Bozor Toifasi Tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Bolalar Tovarlari</span> tahlili
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Ota-onalar farzandlari uchun doim eng yaxshisini tanlashadi.
          O&apos;yinchoqlar, bolalar kiyimi va gigiyena tovarlarining real bozor ko&apos;rsatkichlarini biling.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha chek</span>
          <p className="text-2xl font-extrabold text-foreground">125 000 so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik bozor aylanmasi</span>
          <p className="text-2xl font-extrabold text-primary">26+ mlrd so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha komissiya</span>
          <p className="text-2xl font-extrabold text-emerald-600">14% - 17%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik o&apos;sish</span>
          <p className="text-2xl font-extrabold text-primary">+20%</p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kategoriyadagi eng faol nishalar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Rivojlantiruvchi o'yinchoqlar, yog'och konstruktorlar va mantiqiy o'yinlar",
            "Bolalar kiyimi: bodi, kombinezonlar va kundalik to'plamlar",
            "Bolalar gigiyenasi: tagliklar, nam salfetkalar va bolalar kremlari",
            "Oziqlantirish anjomlari: butilochkalar, so'rg'ichlar va sterilizatorlar",
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
        <h3 className="text-2xl font-bold">Bolalar tovarlari bo&apos;yicha yetakchi bo&apos;ling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali eng xaridorgir o&apos;yinchoqlar va bolalar mahsulotlarini birinchi bo&apos;lib kashf eting.
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
