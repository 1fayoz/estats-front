import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Flame, ShieldAlert, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "HunterSales Muqobili — Uzum va Marketpleyslar Uchun Kuchliroq va Qulayroq Analitika | eStats",
  description:
    "HunterSales o'rniga eng yaxshi muqobil qidiryapsizmi? eStats: Uzum, Yandex, WB va Ozon uchun to'liq bozor tahlili, ombor (FIFO), haqiqiy tan narx va AI tovar SEO vositalari.",
  keywords: [
    "huntersales muqobili",
    "huntersales analog",
    "huntersales uzum",
    "huntersales narxi",
    "huntersales bepul",
    "uzum analitika dasturi",
    "uzum bozor tahlili",
    "tovar razvedkasi uzum",
  ],
  alternates: { canonical: "/muqobil/huntersales" },
  openGraph: {
    title: "HunterSales Muqobili — eStats Analitika Platformasi",
    description: "Nega sotuvchilar HunterSales'dan ko'ra eStats'ni afzal ko'rishadi?",
    url: "https://estats.uz/muqobil/huntersales",
  },
};

const FAQ_ITEMS = [
  {
    question: "HunterSales'dan ko'ra eStats'ning asosiy ustunligi nimada?",
    answer:
      "HunterSales asosan faqat tashqi bozor tahlili bilan cheklanadi. eStats esa ham tashqi bozor razvedkasini, ham ichki do'kon boshqaruvini — ombor (partiyalar, FIFO), moliya (aniq foyda, komissiyalar, PnL), AI tovar SEO va Telegram/Instagram avtopostingni o'z ichiga olgan yagona ekotizimdir.",
  },
  {
    question: "eStats ma'lumotlari qanchalik tez yangilanadi?",
    answer:
      "eStats bozor va tovarlar ma'lumotlarini har kuni avtomatik yangilaydi. Do'koningiz ulanganda esa sotuvlar, qoldiqlar va buyurtmalar real vaqtda sinxronlanadi.",
  },
  {
    question: "Narxi HunterSales'ga qaraganda qanday?",
    answer:
      "eStats bozorga nisbatan ancha shaffof va qulay narxlarni taklif qiladi. Shuningdek, yangi foydalanuvchilar uchun bepul sinov davri va ko'plab ochiq vositalar mavjud.",
  },
];

export default function HunterSalesAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Muqobillar", url: "/muqobil/huntersales" },
          { name: "HunterSales muqobili", url: "/muqobil/huntersales" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> HunterSales Muqobili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          HunterSales o&apos;rniga <span className="text-primary">mukammal va ko&apos;p tarmoqli platforma</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Faqatgina tovar skanerlash bilan to&apos;xtab qolmang. eStats sizga bozor tahlili, aniq FIFO moliya,
          ombor partiyalari va sun&apos;iy intellekt asosidagi tovar optimizatsiyasini beradi.
        </p>
      </header>

      {/* Taqqoslash jadvali */}
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 p-6 text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight">HunterSales vs eStats: batafsil taqqoslash</h2>
          <p className="text-xs text-muted-foreground mt-1">Har bir parametr bo&apos;yicha real imkoniyatlar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 sm:px-6">Imkoniyat / Funksiya</th>
                <th className="p-4 sm:px-6">HunterSales</th>
                <th className="p-4 sm:px-6 text-primary">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 font-medium sm:px-6">Tashqi bozor va nishalar tahlili</td>
                <td className="p-4 text-muted-foreground sm:px-6"><Check className="size-4 text-emerald-500 inline mr-1" /> Mavjud</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> To&apos;liq va chuqur</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Ombor partiyalari va tan narx (FIFO)</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> To&apos;liq FIFO tizimi</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Haqiqiy PnL va sof foyda hisobi</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> Komissiya va logistika bilan</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">AI tovar SEO va kartochka optimizatsiyasi</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> O&apos;rnatilgan AI kopirayter</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Brauzer kengaytmasi (Lens)</td>
                <td className="p-4 text-muted-foreground sm:px-6"><Check className="size-4 text-emerald-500 inline mr-1" /> Asosiy</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> Real vaqt ma&apos;lumotlari</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Telegram va Instagram avtoposting</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> Mavjud</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Ko&apos;p bozorli qo&apos;llab-quvvatlash (Uzum, Yandex, WB, Ozon)</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Cheklangan</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> Multi-Marketplace</td>
              </tr>
            </tbody>
          </table>
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
        <h3 className="text-2xl font-bold">Biznesingizni keyingi bosqichga olib chiqing</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali bozordagi eng kuchli tahlil va boshqaruv qurollariga ega bo&apos;ling.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats&apos;ni bepul sinab ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
