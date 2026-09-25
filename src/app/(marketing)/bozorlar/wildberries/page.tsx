import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Globe, Layers, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Wildberries O'zbekiston Analitika va Ombor Boshqaruvi — WB Sellers Uchun | eStats",
  description:
    "Wildberries Uzbekistan sotuvchilari uchun to'liq analitika va ERP: O'zbekistondan WB omboriga jo'natish, valyuta va so'mdagi sof foyda, komissiyalar, FIFO tan narx va avtomatlashtirish.",
  keywords: [
    "wildberries uzbekistan analitika",
    "wb uzbekistan sklad dasturi",
    "wildberriesda sotuv boshlash uzbekistan",
    "wb komissiyasi hisoblash",
    "wildberries fbs uzbekistan",
    "wb seller uzbekistan",
  ],
  alternates: { canonical: "/bozorlar/wildberries" },
  openGraph: {
    title: "Wildberries O'zbekiston Analitika Platformasi — eStats",
    description: "Wildberries'da savdo qiluvchi O'zbekistonlik tadbirkorlar uchun maxsus yechim.",
    url: "https://estats.uz/bozorlar/wildberries",
  },
};

const FAQ_ITEMS = [
  {
    question: "O'zbekistondan Wildberries'da savdo qilish uchun qanday hisob-kitob kerak?",
    answer:
      "Wildberries to'lovlarni Rublda amalga oshiradi, biroq tovar tannarxi va xarajatlaringiz so'mda bo'ladi. eStats valyuta kurslarini avtomatik hisoblab, sizga O'zbekiston so'midagi aniq sof foyda (PnL) hisobotini beradi.",
  },
  {
    question: "Uzum va Wildberries tovarlarini bitta omborda saqlasa bo'ladimi?",
    answer:
      "Ha! eStats sizga umumiy ombor yaratish imkonini beradi. Bitta tovaringiz ham Uzumda, ham Wildberries'da sotilsa, umumiy qoldiq real vaqtda nazorat qilinadi.",
  },
];

export default function WildberriesMarketPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Bozorlar", url: "/bozorlar/wildberries" },
          { name: "Wildberries O'zbekiston", url: "/bozorlar/wildberries" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Globe className="size-3.5" /> Xalqaro Bozor Integratsiyasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Wildberries O&apos;zbekiston uchun <span className="text-primary">mukammal analitika va ombor</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O&apos;zbekistondan turib butun MDH bozoriga savdo qiling. Valyuta konvertatsiyasi,
          komissiyalar, qaytishlar va haqiqiy tan narx (FIFO) hisobi bitta qulay platformada.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <TrendingUp className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">So&apos;mda sof foyda</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rubl tushumi va transport xarajatlari O&apos;zbekiston Markaziy Banki kursi bo&apos;yicha avtomatik
            konvertatsiya qilinadi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Yagona ombor zaxirasi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uzum va WB uchun umumiy tovar qoldig&apos;ini yuritish orqali tovar yetishmovchiligining oldini oling.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <ShieldCheck className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Komissiya va Jarimalar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WB logistika tariflari, saqlash to&apos;lovlari va kutilmagan jarimalarni aniq ajratib ko&apos;rsatish.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">O&apos;zbekiston WB sotuvchilari uchun imkoniyatlar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "O'zbekistondagi saralash markazlari (FBS) va FBO bo'yicha qoldiqlar",
            "Mavsumiy tovarlar talabi va Rossiya/Qozog'iston bozorlari narx tahlili",
            "MPStats ga qimmat oylik to'lov qilmasdan qulay narxlarda foydalanish",
            "O'zbek tilidagi qulay va tezkor mijozlarni qo'llab-quvvatlash xizmati",
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
        <h3 className="text-2xl font-bold">Wildberries do&apos;koningizni eStats&apos;ga ulang</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Bir necha daqiqada API orqali ulab, xalqaro savdolaringizni nazoratga oling.
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
