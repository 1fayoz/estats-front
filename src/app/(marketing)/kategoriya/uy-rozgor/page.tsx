import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Home, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Uy-Ro'zg'or va Oshxona Tahlili — Kundalik Talab va Doimiy Sotuvlar | eStats",
  description:
    "Uzum Market'dagi uy-ro'zg'or buyumlari, oshxona anjomlari, tozalash vositalari va interyer tovarlari tahlili: o'rtacha aylanma, eng talabgir nishalar va raqobatchilar tahlili.",
  keywords: [
    "uzum uy rozgor tahlili",
    "oshxona anjomlari uzum",
    "uy uchun tovarlar sotuvlari",
    "tozalash vositalari uzum bozor",
    "uy rozgor eng kop sotiladigan tovarlar",
  ],
  alternates: { canonical: "/kategoriya/uy-rozgor" },
  openGraph: {
    title: "Uy-Ro'zg'or va Oshxona Bozor Tahlili — Uzum Market | eStats",
    description: "Uy-ro'zg'or toifasidagi eng ommabop mahsulotlar va ularning oylik tushumi.",
    url: "https://estats.uz/kategoriya/uy-rozgor",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uy-ro'zg'or tovarlarining asosiy afzalligi nimada?",
    answer:
      "Ushbu toifaga talab butun yil davomida barqaror (mavsumiylikka kam bog'liq) bo'ladi. Idishlar, oshxona gadjetlari, saqlash qutilari va tozalash vositalari har kuni xarid qilinadi.",
  },
  {
    question: "Oshxona anjomlarida sinish xavfi (boy) qanday oldini olinadi?",
    answer:
      "Shisha va keramika buyumlarni jo'natishda pufakchali plyonka (puzirchataya plyonka) va qattiq qutilardan foydalanish shart, aks holda omborga yetkazishda yoki xaridor qaytarganda tovar yaroqsiz holga kelishi mumkin.",
  },
];

export default function HomeCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kategoriyalar", url: "/kategoriya/uy-rozgor" },
          { name: "Uy-ro'zg'or va Oshxona", url: "/kategoriya/uy-rozgor" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Home className="size-3.5" /> Bozor Toifasi Tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Uy-Ro&apos;zg&apos;or va Oshxona</span> tahlili
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Barqaror kundalik talab va kam mavsumiylik. Uy va oshxona uchun kerakli anjomlarning
          bozordagi haqiqiy talabini kashf qiling.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha chek</span>
          <p className="text-2xl font-extrabold text-foreground">110 000 so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik bozor aylanmasi</span>
          <p className="text-2xl font-extrabold text-primary">32+ mlrd so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha komissiya</span>
          <p className="text-2xl font-extrabold text-emerald-600">14% - 17%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Talab barqarorligi</span>
          <p className="text-2xl font-extrabold text-foreground">Yil davomida bir xil</p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kategoriyadagi eng xaridorgir nishalar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Oshxona gadjetlari: sabzavot to'g'ragichlar, silikon qoliplar va dispenserlar",
            "Uy va kiyim saqlash uchun organayzerlar, qutilar va vakuumni qoplar",
            "Hammom va oshxona tozalash vositalari, mikrofibra lattalar",
            "Chiroyli idishlar, termokrujkalar va choynaklar",
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
        <h3 className="text-2xl font-bold">Uy-ro&apos;zg&apos;or toifasida doimiy daromad qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bilan raqobatchilardan oldin eng xaridorgir uy anjomlarini aniqlang.
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
