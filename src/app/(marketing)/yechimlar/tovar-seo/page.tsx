import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Check, FileText, Search, Sparkles, Star, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Tovar SEO va Kartochka Optimizatsiyasi — AI bilan TOP-1 ga Chiqish | eStats",
  description:
    "Uzum Market, Yandex va WB qidiruvida tovaringizni 1-o'ringa olib chiqing. AI bilan professional sarlavha, to'liq tavsif, yuqori chastotali kalit so'zlar va konversiyani oshiruvchi rich content.",
  keywords: [
    "uzum tovar seo",
    "kartochka optimizatsiya uzum",
    "marketpleys kalit sozlar",
    "uzum tovar nomini yozish",
    "ai tovar tavsifi",
    "uzumda topga chiqish",
    "rich content uzum",
    "marketplace seo dasturi",
    "ctr oshirish",
  ],
  alternates: { canonical: "/yechimlar/tovar-seo" },
  openGraph: {
    title: "Marketpleys Tovar SEO va Kartochka Optimizatsiyasi — eStats AI",
    description: "Sun'iy intellekt yordamida tovar kartochkangizni qidiruv algoritmlariga 100% moslang.",
    url: "https://estats.uz/yechimlar/tovar-seo",
  },
};

const FAQ_ITEMS = [
  {
    question: "Marketpleysda tovar SEO qanday ishlaydi?",
    answer:
      "Xaridorlar tovar qidirganda (masalan, «erkaklar soati» yoki «termos»), algoritm tovar nomi, tavsifi va xususiyatlaridagi kalit so'zlarni skanerlaydi. eStats qidiruv chastotasi eng yuqori bo'lgan so'zlarni to'plab, tovar kartochkangizga to'g'ri joylashtirishingizga yordam beradi.",
  },
  {
    question: "AI (Sun'iy intellekt) tavsifni qanday yozadi?",
    answer:
      "eStats AI tovaringiz xususiyatlarini va bozordagi top raqobatchilarning eng ko'p sotilgan kartochkalarini tahlil qiladi. Bir necha soniyada xaridorni jalb qiluvchi va qidiruv tizimlari (Uzum, WB) indeksiga to'liq tushadigan tavsif yaratadi.",
  },
  {
    question: "Raqobatchilar qaysi kalit so'zlardan foydalanayotganini ko'rish mumkinmi?",
    answer:
      "Ha. eStats raqobatchilar kartochkalarini skanerlab, ularning qaysi so'zlar bo'yicha yuqori o'rinlarda turganini va qaysi so'rovlar ularga eng ko'p savdo olib kelayotganini ko'rsatib beradi.",
  },
];

export default function ProductSeoSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/tovar-seo" },
          { name: "Tovar SEO va AI Optimizatsiya", url: "/yechimlar/tovar-seo" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Bot className="size-3.5" /> AI Tovar SEO va Qidiruv
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleys qidiruvida <span className="text-primary">organik TOP-1 ga chiqing</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Reklamaga pul sarflamasdan ham savdoni oshirish mumkin. Tovar kartochkangizni sun&apos;iy intellekt
          va yuqori talabli kalit so&apos;zlar bilan qidiruv algoritmlariga 100% moslang.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Search className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Kalit so&apos;zlar tahlili</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Odamlar sizning toifangizdagi tovarlarni nima deb qidirayotganini aniq bilib oling.
            Bo&apos;sh va yuqori konversiyali qidiruv iboralarini toping.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Sparkles className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">AI Kartochka Kopirayteri</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bir klik bilan tovaringiz uchun jozibador nom, batafsil sotuvchi tavsif va to&apos;liq
            xususiyatlar ro&apos;yxatini sun&apos;iy intellekt orqali yarating.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <TrendingUp className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Pozitsiyalar monitoringi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tovaringiz qidiruv natijalarida nechanchi o&apos;rinda turganini har kuni kuzatib boring.
            Optimizatsiyaning savdoga ta&apos;sirini ko&apos;ring.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Nega tovar SEO reklamadan yaxshiroq?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Reklama tugasa savdo to'xtaydi, organik SEO esa doimiy bepul xaridorlarni olib keladi",
            "Maksimal to'ldirilgan kartochkalar marketpleys algoritmlari tomonidan yuqoriga suriladi",
            "Sotuvchi to'g'ri kalit so'zlarni kiritganda konversiya va CTR 2-3 barobargacha oshadi",
            "Raqobatchilarning kuchsiz tomonlarini topib, ulardan ustun kelish imkoniyati",
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
        <h3 className="text-2xl font-bold">Tovarlaringiz qidiruvda birinchi bo&apos;lsin</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats AI bilan kartochkalaringizni optimallashtiring va bepul organik sotuvlarni oshiring.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Tovar SEO ni sinab ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
