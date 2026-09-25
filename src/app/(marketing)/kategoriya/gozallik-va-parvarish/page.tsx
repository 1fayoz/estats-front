import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Flame, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Go'zallik va Parvarish Tahlili — Kosmetika, Parfyumeriya va Top Brendlar | eStats",
  description:
    "Uzum Market'dagi go'zallik, kosmetika va shaxsiy parvarish toifasi tahlili: yuqori takroriy xaridlar (LTV), eng ko'p sotilayotgan kremlar, zardoblar (serum), parfyumeriya va bo'sh nishalar.",
  keywords: [
    "uzum kosmetika tahlili",
    "gozallik tovarlari sotuvlari uzum",
    "parfyumeriya uzum market",
    "koreys kosmetikasi uzum",
    "eng kop sotiladigan kremlar",
    "kosmetika marjasi",
  ],
  alternates: { canonical: "/kategoriya/gozallik-va-parvarish" },
  openGraph: {
    title: "Go'zallik va Parvarish Bozor Tahlili — Uzum Market | eStats",
    description: "Kosmetika toifasidagi eng talabgir tovarlar va raqobat darajasi.",
    url: "https://estats.uz/kategoriya/gozallik-va-parvarish",
  },
};

const FAQ_ITEMS = [
  {
    question: "Nega go'zallik va kosmetika toifasi eng daromadli hisoblanadi?",
    answer:
      "Chunki bu toifada tovarlar tez tugaydi va xaridorlar yana qayta sotib oladi (yuqori LTV va takroriy xarid). Shuningdek, tovarlarning hajmi kichik bo'lgani sababli logistika va saqlash xarajatlari minimal bo'ladi.",
  },
  {
    question: "Kosmetika tovarlarida sertifikat talab qilinadimi?",
    answer:
      "Ha, Uzum Market gigiyena va kosmetika mahsulotlariga muvofiqlik sertifikati va rasmiy hujjatlarni qat'iy talab qiladi. Sertifikatsiz tovarlar moderatsiyadan o'tmaydi.",
  },
];

export default function BeautyCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kategoriyalar", url: "/kategoriya/gozallik-va-parvarish" },
          { name: "Go'zallik va Parvarish", url: "/kategoriya/gozallik-va-parvarish" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Bozor Toifasi Tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Go&apos;zallik va Parvarish</span> tahlili
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Yuqori takroriy xaridlar va ixcham logistika. O&apos;zbekistonda eng tez o&apos;sayotgan
          kosmetika va shaxsiy parvarish toifasining barcha ma&apos;lumotlari.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha chek</span>
          <p className="text-2xl font-extrabold text-foreground">95 000 so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik bozor aylanmasi</span>
          <p className="text-2xl font-extrabold text-primary">28+ mlrd so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha komissiya</span>
          <p className="text-2xl font-extrabold text-emerald-600">14% - 18%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Takroriy xarid darajasi</span>
          <p className="text-2xl font-extrabold text-primary">Yuqori (40%+)</p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kategoriyadagi eng faol nishalar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Yuz va tana parvarishi uchun zardoblar (serumlar) va namlantiruvchi kremlar",
            "Soch parvarishi: sulfatsiz shampunlar, niqoblar va soch to'kilishiga qarshi vositalar",
            "Ayollar va erkaklar uchun ommabop kundalik parfyumeriya (atir va xushbo'ylatgichlar)",
            "Dekorativ kosmetika: tonal kremlar, lab bo'yoqlari va ko'z qalamlari",
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
        <h3 className="text-2xl font-bold">Go&apos;zallik toifasidagi xit tovarlarni toping</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali trenddagi tovarlar va raqobatchilarning kunlik savdo hajmini kuzatib boring.
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
