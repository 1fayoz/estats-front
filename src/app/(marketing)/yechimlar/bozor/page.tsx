import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Eye, Flame, Search, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Bozor va Nishalar Tahlili — Tovar Qidirish va Raqobatchilar | eStats",
  description:
    "Uzum Market, Yandex Market, Wildberries va Ozon bozor analitikasi. Bo'sh nishalarni topish, tovar sotuvlar hajmi, raqobatchilar bahosi, oylik aylanma va talab o'sishini kuzatish.",
  keywords: [
    "bozor tahlili uzum",
    "marketpleys nisha tanlash",
    "tovar qidirish marketplace",
    "raqobatchilar tahlili",
    "uzum sotuvlar hajmi",
    "bo'sh nishalar uzum market",
    "top tovarlar marketplace",
    "marketpleys razvedka",
    "uzum tahlili",
  ],
  alternates: { canonical: "/yechimlar/bozor" },
  openGraph: {
    title: "Marketpleys Bozor va Nishalar Tahlili — Daromadli tovarlarni oldindan aniqlang",
    description:
      "Uzum, Yandex va boshqa bozorlardagi eng ko'p sotilayotgan tovarlar va raqobatchilar sirlari.",
    url: "https://estats.uz/yechimlar/bozor",
  },
};

const FAQ_ITEMS = [
  {
    question: "Bozor tahlili menga yangi tovar tanlashda qanday yordam beradi?",
    answer:
      "Ko'r-ko'rona tovar olib kirish xavfli. eStats orqali siz qaysi kategoriyada talab yuqori, ammo sotuvchilar va tovarlar soni kamligini (bo'sh nishalarni) ko'rasiz. Shuningdek, tovarning mavsumiyligi va oylik aylanmasini aniq bilib xarid qilasiz.",
  },
  {
    question: "Raqobatchilarning kunlik va oylik sotuvlarini ko'rsa bo'ladimi?",
    answer:
      "Ha. Tizim raqobatchilarning tovar qoldiqlari o'zgarishi va narxlarini kunlik skanerlab, ularning qancha dona sotayotganini va qancha pul aylanayotganini hisoblab beradi.",
  },
  {
    question: "Qidiruv natijalari qanchalik tez-tez yangilanadi?",
    answer:
      "Bozor ma'lumotlari har kuni avtomatik yangilanadi. Trenddagi tovarlar, keskin o'sayotgan yoki sotuvi to'xtagan tovarlar dinamikasini grafigi bilan kuzatishingiz mumkin.",
  },
];

export default function MarketSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/bozor" },
          { name: "Bozor va Nishalar", url: "/yechimlar/bozor" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="size-3.5" /> Bozor Razvedkasi va Nishalar
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">kuchli tashqi bozor tahlili</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O&apos;zbekiston va xalqaro marketpleyslardagi eng talabgir tovarlar, bo&apos;sh nishalar va raqobatchilarning
          haqiqiy sotuvlarini kashf eting. Tavakkal qilishni to&apos;xtating.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Flame className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Bo&apos;sh va daromadli nishalar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Talab katta, lekin sifatli taklif kam bo&apos;lgan nishalarni birinchi bo&apos;lib toping.
            Bozorga eng kerakli tovar bilan kirib boring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Eye className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Raqobatchilar tahlili</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Raqobatchilaringiz kuniga nechta sotyapti, qancha pul ishlayapti, qachon narx tushirdi yoki ko&apos;tardi —
            barchasini ochiq ko&apos;ring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <TrendingUp className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Trendlar va mavsumiylik</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tovarning qaysi oylarda eng ko&apos;p talabga ega bo&apos;lishini oldindan rejalashtiring.
            Mavsum boshlanishidan oldin omborni kerakli mahsulot bilan to&apos;ldiring.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Tovarni omborga tiqib qo&apos;ymaslik uchun</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Oylik aylanma va o'rtacha chekni ko'rib xarid hajmiga baho berish",
            "Monopoliya bor-yo'qligini aniqlash: bozorni 1-2 sotuvchi egallab olganmi?",
            "Uzum, Yandex va Wildberries kabi bozorlar o'rtasida narxlar farqi (arbitraj)",
            "Yangi tovarlar reytingi va tez ko'tarilayotgan yulduzlar tahlili",
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
        <h3 className="text-2xl font-bold">Keyingi xit tovaringizni bugun toping</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bozor tahlili bilan xarid risklarini kamaytiring va yuqori marjali savdo qiling.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Bozorni tahlil qilish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
