import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Globe2, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "MPStats O'zbekiston — eStats | Uzum, Wildberries, Ozon va Yandex Tahlili",
  description:
    "MPStats O'zbekistonda juda qimmat va Uzum Market ma'lumotlarini to'liq bermayaptimi? eStats — Uzum, Wildberries, Ozon va Yandex Market uchun arzon, qulay va mahalliy to'lovlarga mos mukammal tahlil platformasi.",
  keywords: [
    "mpstats uzbekistan",
    "mpstats uzum",
    "mpstats narxi",
    "mpstats muqobili",
    "wildberries analitika uzbekistan",
    "ozon analitika toshkent",
    "yandex market analitika o'zbekiston",
    "estats vs mpstats",
  ],
  alternates: { canonical: "/muqobil/mpstats" },
  openGraph: {
    title: "MPStats O'zbekiston — eStats: Bozorlar tahlili va boshqaruvi",
    description:
      "Uzum Market, Wildberries, Ozon va Yandex Market bir joyda. Mahalliy to'lovlar, FIFO tan narx va arzon tariflar.",
    url: "https://estats.uz/muqobil/mpstats",
  },
};

const FAQ_ITEMS = [
  {
    question: "Nega MPStats o'rniga eStats tanlashadi?",
    answer:
      "MPStats Rossiya bozoriga (WB, Ozon) qaratilgan va narxi oyiga yuzlab dollarni tashkil etadi, O'zbekistonning asosiy bozori Uzum Market ma'lumotlari esa unda to'liq emas. eStats Uzum Market va xalqaro bozorlarni to'liq qamrab oladi, Payme/Click orqali qabul qiladi va bir necha barobar arzon.",
  },
  {
    question: "eStats Wildberries va Ozon tahlilini ham beradimi?",
    answer:
      "Ha! eStats ko'p bozorli tizim bo'lib, Uzum Market bilan bir qatorda Yandex Market, Wildberries va Ozon bilan ishlaydigan sotuvchilar uchun yagona hisob-kitob va tahlil markazi vazifasini bajaradi.",
  },
];

export default function MpstatsAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Muqobil", url: "/muqobil/mpstats" },
          { name: "MPStats muqobili", url: "/muqobil/mpstats" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Globe2 className="size-3.5" /> MPStats muqobili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          MPStats O&apos;zbekiston uchun: <span className="text-primary">Nega eStats yaxshiroq?</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          MPStats xalqaro bozorlarda mashhur bo&apos;lsa-da, O&apos;zbekiston bozori uchun qimmat va noqulay.
          eStats — mahalliy Uzum Market hamda Wildberries, Ozon va Yandex Market&apos;ni bitta ekotizimda
          birlashtirgan qulay va arzon platforma.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="text-3xl font-extrabold text-primary">5× arzon</div>
          <h3 className="font-semibold text-lg">Mahalliy qulay narxlar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MPStats oylik obunasi 300-500$ dan boshlanadi. eStats esa barcha imkoniyatlarni mahalliy
            sotuvchilar uchun qulay narxlarda va Payme, Click, Uzum Pay orqali taklif etadi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="text-3xl font-extrabold text-primary">Uzum + WB</div>
          <h3 className="font-semibold text-lg">O&apos;zbekiston bozoriga mos</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MPStats Uzum Market&apos;ning o&apos;ziga xosliklarini, komissiya stavkalarini va Toshkent
            omborlarini hisobga olmaydi. eStats esa Uzum ekotizimini ich-ichidan biladi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="text-3xl font-extrabold text-primary">FIFO ERP</div>
          <h3 className="font-semibold text-lg">Haqiqiy foyda hisobi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Faqatgina sotuvlar soni emas, balki tovar partiyalarining tan narxi, ombor qoldiqlari va
            sof foyda hisobini avtomatlashtirilgan tarzda yuritish imkoniyati.
          </p>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <footer className="rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-card p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold sm:text-3xl text-foreground">
          Barcha bozorlaringizni bitta joydan boshqaring
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
          eStats bilan Uzum, Yandex, WB va Ozon savdolaringizni tartibga soling.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
          >
            Sinab ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
