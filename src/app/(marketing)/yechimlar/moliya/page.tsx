import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Check, DollarSign, LineChart, PieChart, ShieldCheck } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Moliya va Kirim-Chiqim Dasturi — Tan Narx (FIFO) va Sof Foyda | eStats",
  description:
    "Uzum Market, Yandex Market, Wildberries va Ozon uchun professional moliya va kirim-chiqim dasturi. FIFO bo'yicha tan narx, komissiya, logistika, marja, ROI va P&L hisoboti.",
  keywords: [
    "marketpleys moliya dasturi",
    "tan narx hisoblash",
    "fifo hisob-kitob",
    "kirim chiqim uzum",
    "marketpleys foyda hisobi",
    "pnl hisoboti marketplace",
    "uzum komissiyasi hisoblash",
    "roi marja hisoblagich",
    "savdo moliyasi",
  ],
  alternates: { canonical: "/yechimlar/moliya" },
  openGraph: {
    title: "Marketpleys Moliya va Kirim-Chiqim Dasturi — Haqiqiy sof foydangizni biling",
    description:
      "Komissiya, logistika va FIFO tan narxi hisobga olingan holda har bir so'm daromad va sof foyda hisobi.",
    url: "https://estats.uz/yechimlar/moliya",
  },
};

const FAQ_ITEMS = [
  {
    question: "Nima uchun o'rtacha narx emas, FIFO (First-In, First-Out) usuli muhim?",
    answer:
      "Savdoda tovar narxi doimiy o'zgaradi (masalan, birinchi partiya $2 dan, ikkinchi partiya $2.5 dan olingan). FIFO usulida eski narxdagi tovar birinchi sotilgan deb hisoblanadi, shunda sizning sof foydangiz sun'iy oshib yoki tushib ketmaydi, hisobotlar 100% soliq va buxgalteriya aniqligiga ega bo'ladi.",
  },
  {
    question: "Bozor komissiyasi va logistika xarajatlari qanday hisobga olinadi?",
    answer:
      "eStats marketpleys tariflarini (Uzum foizlari, kuryerlik to'lovlari, saqlash, qaytishlar) avtomatik tarzda tovar kategoriyasi va hajmiga qarab yuklab oladi va sotuv narxidan chegiradi. Siz qo'lda kalkulyatorda hisoblashingiz shart emas.",
  },
  {
    question: "Qaysi tovarlar zararga ishlayotganini ko'ra olamanmi?",
    answer:
      "Ha. eStats P&L (Daromad va Zarar) tahlili orqali yuqori aylanmaga ega, ammo reklamasi yoki komissiyasi qimmatligi tufayli do'konni minusga tushirayotgan tovarlarni (Money Drainers) bir zumda aniqlab beradi.",
  },
];

export default function FinanceSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/moliya" },
          { name: "Moliya va Kirim-Chiqim", url: "/yechimlar/moliya" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Calculator className="size-3.5" /> Moliya va Kirim-Chiqim
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">aniq moliya va sof foyda hisobi</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Katta aylanma har doim ham katta daromad degani emas. eStats bilan tan narx, bozor komissiyasi,
          logistika va reklamani hisobga olgan holda qo&apos;lingizda qoladigan haqiqiy sof foydani ko&apos;ring.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <DollarSign className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">FIFO bo&apos;yicha tan narx</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Har xil partiyalardan kelgan tovarlar alohida hisoblanadi. Tovarning haqiqiy tan narxi sotuv vaqtidagi
            partiya asosida avtomatik belgilanadi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <PieChart className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Komissiya va xarajatlar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Marketpleys komissiyasi, saqlash, yetkazib berish va qaytgan tovarlar xarajatlari to&apos;liq
            ajratiladi. Har bir so&apos;m qayerga ketayotganini aniq bilasiz.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <LineChart className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">P&L va Marjinallik (ROI)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Qaysi tovar eng ko&apos;p sof foyda keltiryapti, qaysi biri esa zararga ishlayapti? Marja va ROI
            ko&apos;rsatkichlari sizga to&apos;g&apos;ri biznes qaror qabul qilishda yordam beradi.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kalkulyatordagi xatolardan qutuling</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Qo'lda Excel jadval to'ldirishga hojat yo'q — barcha ma'lumot avtomatlashtirilgan",
            "Soliqlar, logistika va ombor xarajatlarini inobatga olgan sof hisobot",
            "Bir nechta do'kon va bozorlarning moliyasini bitta ekranda jamlash",
            "Mavsumiy chegirmalar va aksiyalarning foydaga ta'sirini oldindan bilish",
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
        <h3 className="text-2xl font-bold">Moliyangizni shaffof va aniq qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bilan do&apos;koningizning real foydasini hisoblang va ortiqcha xarajatlarni to&apos;xtating.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Bepul sinab ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
