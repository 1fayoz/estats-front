import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, Eye, Globe, Layers, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "eStats Lens — Uzum Market va Marketpleyslar Uchun Chrome Kengaytmasi | eStats",
  description:
    "Uzum Market veb-saytida to'g'ridan-to'g'ri tovar kartochkasi ustida uning oylik sotuvlari, kunlik dinamikasi, qoldiqlari va tushumini ko'rsatib turuvchi bepul Chrome Extension.",
  keywords: [
    "uzum chrome extension",
    "uzum kengaytma",
    "uzum plagin",
    "estats lens",
    "marketpleys brauzer kengaytmasi",
    "uzum tovar sotuvini korish",
    "uzum qoldiqlarini korish plagin",
  ],
  alternates: { canonical: "/yechimlar/uzum-lens" },
  openGraph: {
    title: "eStats Lens — To'g'ridan-to'g'ri bozor sahifasida tovar sirlarini oching",
    description: "Uzum Market tovarlarining sotuv hajmi va daromadini 1 klikda ko'ring.",
    url: "https://estats.uz/yechimlar/uzum-lens",
  },
};

const FAQ_ITEMS = [
  {
    question: "eStats Lens qanday o'rnatiladi?",
    answer:
      "Chrome Web Store orqali bir klikda brauzeringizga o'rnatasiz. O'rnatilgach, Uzum Market sahifasiga kirganingizda har bir tovar kartochkasi ostida avtomatik tahlil vidjeti paydo bo'ladi.",
  },
  {
    question: "Kengaytma qaysi ma'lumotlarni ko'rsatadi?",
    answer:
      "Tovarning oxirgi 30 kundagi sotuvlar soni, oylik aylanmasi (daromadi), qoldiqlari qancha qolgani, kunlik sotuv grafigi va narx o'zgarishlari tarixini ko'rsatadi.",
  },
  {
    question: "Kengaytmadan foydalanish bepulmi?",
    answer:
      "Ha, asosiy ko'rsatkichlarni ko'rish mutlaqo bepul. Chuqurroq tahlillar uchun eStats akkauntingizga ulanadi.",
  },
];

export default function UzumLensSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/uzum-lens" },
          { name: "eStats Lens Kengaytmasi", url: "/yechimlar/uzum-lens" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Globe className="size-3.5" /> Brauzer Kengaytmasi (Extension)
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum sahifasining o&apos;zida <span className="text-primary">tovar sotuvlarini ko&apos;ring</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          eStats Lens — Uzum Market veb-saytiga to&apos;g&apos;ridan-to&apos;g&apos;ri integratsiya qilinuvchi plagin.
          Tovarni ko&apos;rib turgan joyingizda uning oylik aylanmasi, qoldiqlari va kunlik sotuvlarini biling.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Eye className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Tezkor razvedka</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Har qanday tovar ustiga kelganda sotuvlar soni va aylanmasi darhol ko&apos;rinadi.
            Alohida tab ochib yurishingiz shart emas.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Qoldiqlar monitoringi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Raqobatchingiz omborida nechta tovar qolganini va qachon tugashini aniq ko&apos;ring.
            Ular tovari tugaganda o&apos;z taklifingizni chiqaring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Zap className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Narxlar dinamikasi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Raqobatchi tovar narxini qachon tushirgani yoki oshirganini grafikda ko&apos;rib, to&apos;g&apos;ri narx strategiyasini
            belgilang.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 text-center space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kengaytmani bugunoq o&apos;rnating</h2>
        <p className="max-w-xl mx-auto text-muted-foreground text-sm sm:text-base">
          Chrome Web Store orqali bir necha soniyada o&apos;rnatib, bozorni haqiqiy professional kabi tahlil qiling.
        </p>
        <div>
          <Link
            href="/lens"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            <Download className="size-4" /> Kengaytmani yuklab olish
          </Link>
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
        <h3 className="text-2xl font-bold">Har bir xarid va tovar qarori aniq ma&apos;lumotga asoslansin</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats Lens bilan ko&apos;r-ko&apos;rona savdo qilishni unuting.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Tizimga kirish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
