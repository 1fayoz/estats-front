import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Layers, ShieldCheck, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Yandex Market O'zbekiston Analitika va Boshqaruv — Sellers Uchun | eStats",
  description:
    "Yandex Market Uzbekistan sotuvchilari uchun professional analitika: Toshkent va butun respublika bo'yicha savdo tushumi, komissiya, logistika, ombor qoldiqlari va sof foyda hisobi.",
  keywords: [
    "yandex market uzbekistan analitika",
    "yandex market sotuvchi uzbekistan",
    "yandex market komissiyasi",
    "yandex market ombor hisobi",
    "yandex market toshkent",
  ],
  alternates: { canonical: "/bozorlar/yandex-market" },
  openGraph: {
    title: "Yandex Market O'zbekiston Analitika Tizimi — eStats",
    description: "Yandex Market'dagi savdolaringizni Uzum bilan birga bitta joyda boshqaring.",
    url: "https://estats.uz/bozorlar/yandex-market",
  },
};

const FAQ_ITEMS = [
  {
    question: "Yandex Market Uzbekistan do'konini ulash qanday amalga oshiriladi?",
    answer:
      "eStats Integratsiyalar bo'limida Yandex Market API kalitingizni kiritasiz. Tizim avtomatik barcha SKU tovarlaringiz, narxlar va buyurtmalarni yuklab oladi.",
  },
  {
    question: "Yandex Market komissiyasi va kuryerlik to'lovlari hisobga olinadimi?",
    answer:
      "Ha. eStats Yandex Marketning amaldagi tariflari bo'yicha har bir tovar buyurtmasidan komissiya va yetkazish haqini yechib, haqiqiy toza foydani ko'rsatadi.",
  },
];

export default function YandexMarketPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Bozorlar", url: "/bozorlar/yandex-market" },
          { name: "Yandex Market O'zbekiston", url: "/bozorlar/yandex-market" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="size-3.5" /> Bozor Integratsiyasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Yandex Market O&apos;zbekiston uchun <span className="text-primary">kuchli analitika</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tez sur&apos;atlarda rivojlanayotgan Yandex Market ekotizimida savdo qiling. Buyurtmalar,
          yetkazib berish, narxlar monitoringi va sof foyda hisobi bitta ekranda.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <TrendingUp className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Haqiqiy foyda (PnL)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Komissiya, FBS yetkazish xarajatlari va tovar tannarxini ayirib, har bir buyurtmadan qoladigan sof foydani biling.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Uzum bilan sinxronlik</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ham Uzumda, ham Yandex Marketda sotayotgan bo&apos;lsangiz, bitta umumiy ombor zaxirasini markazlashtiring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <ShieldCheck className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Narxlar nazorati</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Raqobatchilar narxini va aksiyalarni kuzatib borib, bozorda eng maqbul taklifni bering.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Nega eStats Yandex Market sotuvchisiga kerak?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Bir nechta marketpleyslar o'rtasida tovarlarni avtomatik muvofiqlashtirish",
            "Moliya va to'lovlarni o'zbek so'mida to'liq nazorat qilish",
            "Dasturchi yollamasdan API orqali 1 daqiqada do'konni ulash",
            "Mavsumiy talab o'sishida qoldiqlar bo'yicha oldindan ogohlantirish",
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
        <h3 className="text-2xl font-bold">Yandex Market savdolarini hoziroq boshqaring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats platformasi bilan do&apos;konlaringizni bitta professional panelda birlashtiring.
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
