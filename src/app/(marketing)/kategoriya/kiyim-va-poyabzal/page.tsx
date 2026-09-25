import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Flame, Shirt, TrendingUp, Users } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Kiyim va Poyabzal Bozor Tahlili — Oylik Savdolar va Mavsumiy Trendlar | eStats",
  description:
    "Uzum Market'dagi kiyim-kechak, poyabzal va aksessuarlar toifasi tahlili: o'rtacha chek, eng ko'p sotilayotgan modellar, qaytish foizlari (vozvrat), mavsumiy o'sish va daromadli nishalar.",
  keywords: [
    "uzum kiyim kechak tahlili",
    "uzum poyabzal sotuvlari",
    "eng kop sotiladigan kiyimlar uzum",
    "kiyim marjasi uzum",
    "kiyim qaytish foizi uzum",
    "kiyim nishalari marketpleys",
  ],
  alternates: { canonical: "/kategoriya/kiyim-va-poyabzal" },
  openGraph: {
    title: "Kiyim va Poyabzal Bozor Tahlili — Uzum Market | eStats",
    description: "Kiyim toifasida eng yuqori marja va talabga ega tovarlar qaysilar?",
    url: "https://estats.uz/kategoriya/kiyim-va-poyabzal",
  },
};

const FAQ_ITEMS = [
  {
    question: "Kiyim-kechak toifasida qaytishlar (vozvrat) ko'rsatkichi qanday hisoblanadi?",
    answer:
      "Kiyim va poyabzalda xaridor o'lchami to'g'ri kelmasligi sababli o'rtacha 15-25% qaytishlar kuzatiladi. eStats unit iqtisodiyoti kalkulyatori qaytish xarajatlarini oldindan hisoblab, toza sof foydani bilishga imkon beradi.",
  },
  {
    question: "Kiyim toifasida qaysi oylarda savdo eng yuqori bo'ladi?",
    answer:
      "Mavsum almashinuvida (sentyabr-oktyabr kutilayotgan qishki mavsum, mart-aprel bahoriy mavsum) savdolar 2-3 barobargacha oshadi. Omborni oldindan to'ldirish juda muhim.",
  },
];

export default function FashionCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kategoriyalar", url: "/kategoriya/kiyim-va-poyabzal" },
          { name: "Kiyim va Poyabzal", url: "/kategoriya/kiyim-va-poyabzal" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Shirt className="size-3.5" /> Bozor Toifasi Tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Kiyim va Poyabzal</span> tahlili
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Yuqori marjali, biroq o&apos;lchamlar to&apos;ri va qaytishlarni aniq hisoblashni talab qiluvchi toifa.
          Bozor talabi, o&apos;rtacha chek va daromadli nishalarni o&apos;rganing.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha chek</span>
          <p className="text-2xl font-extrabold text-foreground">140 000 so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik bozor aylanmasi</span>
          <p className="text-2xl font-extrabold text-primary">38+ mlrd so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha komissiya</span>
          <p className="text-2xl font-extrabold text-emerald-600">16% - 20%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha qaytish ulushi</span>
          <p className="text-2xl font-extrabold text-rose-500">18%</p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kategoriyadagi eng xaridorgir yo&apos;nalishlar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Erkaklar va ayollar kundalik trikotaj kiyimlari (Hudi, futbolka, xudi)",
            "Mavsumiy poyabzallar va krossovkalar",
            "Bolalar kiyimlari to'plami va yangi tug'ilgan chaqaloqlar uchun tovarlar",
            "Aksessuarlar: charm kamarlar, sumkalar va ryukzaklar",
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
        <h3 className="text-2xl font-bold">Kiyim nishasini professional tahlil qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali qaysi o&apos;lchamlar va ranglar eng ko&apos;p sotilayotganini oldindan bilib xarid qiling.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Nishalarni ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
