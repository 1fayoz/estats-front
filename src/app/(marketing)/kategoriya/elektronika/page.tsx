import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Cpu, Flame, Smartphone, TrendingUp, Users } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Elektronika Bozor Tahlili — Oylik Savdolar, Top Nishalar va Narxlar | eStats",
  description:
    "Uzum Market'dagi elektronika va maishiy texnika kategoriyasi tahlili: oylik aylanma, o'rtacha chek, eng ko'p sotilayotgan smartfon aksessuarlari, quloqchinlar va bo'sh nishalar.",
  keywords: [
    "uzum elektronika tahlili",
    "elektronika eng kop sotiladigan tovarlar uzum",
    "smartfon aksessuarlari sotuvlari",
    "quloqchinlar uzum bozor",
    "elektronika oylik aylanma uzum",
    "bo'sh nishalar elektronika",
  ],
  alternates: { canonical: "/kategoriya/elektronika" },
  openGraph: {
    title: "Elektronika Kategoriyasi Tahlili — Uzum Market | eStats",
    description: "Elektronika toifasida qaysi tovarlar eng ko'p daromad keltirmoqda?",
    url: "https://estats.uz/kategoriya/elektronika",
  },
};

const FAQ_ITEMS = [
  {
    question: "Elektronika toifasida yangi sotuvchi kirishi qanchalik oson?",
    answer:
      "Elektronika — eng katta aylanmaga ega, ammo raqobat ham eng yuqori bo'lgan toifadir. Smartfon g'iloflari (chexol) va simlar kabi qizg'in nishalardan ko'ra, o'ziga xos avtoelektronika yoki maishiy foydali gadjetlar kabi bo'shroq subkategoriyalarni tanlash tavsiya etiladi.",
  },
  {
    question: "Uzum Marketda elektronika bo'yicha komissiya necha foiz?",
    answer:
      "Elektronika va maishiy texnika bo'yicha Uzum komissiyasi tovar turiga qarab odatda 5% dan 12% gacha oraliqda bo'ladi.",
  },
];

export default function ElectronicsCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kategoriyalar", url: "/kategoriya/elektronika" },
          { name: "Elektronika va Maishiy texnika", url: "/kategoriya/elektronika" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Cpu className="size-3.5" /> Bozor Toifasi Tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Elektronika va Texnika</span> tahlili
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O&apos;zbekiston bozorida eng katta savdo hajmiga ega bo&apos;lgan toifa. Tovar aylanmasi,
          eng talabgir nishalar va raqobatchilar daromadini bilib oling.
        </p>
      </header>

      {/* Statistika ko'rsatkichlari */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha chek</span>
          <p className="text-2xl font-extrabold text-foreground">185 000 so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik bozor aylanmasi</span>
          <p className="text-2xl font-extrabold text-primary">45+ mlrd so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha komissiya</span>
          <p className="text-2xl font-extrabold text-emerald-600">8% - 12%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Sotuvchi kartochkalar ulushi</span>
          <p className="text-2xl font-extrabold text-foreground">62%</p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kategoriyadagi eng talabgir nishalar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Simsiz quloqchinlar va Bluetooth aksessuarlar",
            "Smart-soatlar, fitnes brasletlar va ularning remeshoklari",
            "Tezkor quvvatlagichlar (GaN adapters), Type-C kabellar va Powerbanklar",
            "Avtomobil uchun magnitli ushlagichlar va FM modulyatorlar",
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
        <h3 className="text-2xl font-bold">Elektronika tovarlarini to&apos;liq skaner qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats platformasi orqali har bir tovarning oylik savdosi va qoldiqlar dinamikasini ko&apos;ring.
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
