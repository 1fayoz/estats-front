import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "SellerFox Muqobili — O'zbekiston va MDH Marketpleyslari Uchun Mukammal Yechim | eStats",
  description:
    "SellerFox o'rniga zamonaviy muqobil: Uzum Market, Yandex Market, Wildberries va Ozon tahlili. Narx segmentlari, nishalar, ombor (FIFO), haqiqiy marja va AI tovar kartochkalari.",
  keywords: [
    "sellerfox muqobili",
    "sellerfox analog",
    "sellerfox uzum",
    "sellerfox uzbekistan",
    "marketpleys analitika",
    "wildberries ozon uzum tahlil",
    "raqobatchilar monitoringi",
  ],
  alternates: { canonical: "/muqobil/sellerfox" },
  openGraph: {
    title: "SellerFox Muqobili — eStats Multi-Marketplace Platformasi",
    description: "Nima uchun O'zbekiston sotuvchilari eStats'ni tanlaydi?",
    url: "https://estats.uz/muqobil/sellerfox",
  },
};

const FAQ_ITEMS = [
  {
    question: "SellerFox bilan taqqoslaganda eStats kimlar uchun ko'proq mos keladi?",
    answer:
      "SellerFox asosan Rossiya bozorlariga (WB, Ozon) qaratilgan va Uzum Market bo'yicha to'liq integratsiya, o'zbek so'midagi moliya yoki milliy soliq/komissiya hisob-kitoblariga ega emas. eStats O'zbekiston bozorini (Uzum) birinchi o'ringa qo'yadi va bir vaqtning o'zida xalqaro bozorlarni ham qamrab oladi.",
  },
  {
    question: "eStats do'konim ichidagi ma'lumotlarni qanday himoyalaydi?",
    answer:
      "Har bir sotuvchining API tokenlari, tovar tannarxlari va moliyaviy hisobotlari shifrlangan holda alohida xavfsiz muhitda saqlanadi. Hech bir raqobatchi sizning ichki hisoblaringizni ko'ra olmaydi.",
  },
];

export default function SellerFoxAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Muqobillar", url: "/muqobil/sellerfox" },
          { name: "SellerFox muqobili", url: "/muqobil/sellerfox" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="size-3.5" /> SellerFox Muqobili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          SellerFox o&apos;rniga <span className="text-primary">mahalliy va xalqaro bozorlar uchun eStats</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Uzum Market, Yandex Market, Wildberries va Ozon — barchasi bitta qulay platformada.
          Milliy to&apos;lovlar, so&apos;mdagi hisob-kitob va 100% moslashgan interfeys.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 p-6 text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight">SellerFox va eStats solishtirmasi</h2>
          <p className="text-xs text-muted-foreground mt-1">Imkoniyatlar va mahalliylashtirish darajasi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 sm:px-6">Xususiyat</th>
                <th className="p-4 sm:px-6">SellerFox</th>
                <th className="p-4 sm:px-6 text-primary">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 font-medium sm:px-6">Uzum Market to&apos;liq tahlili</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> Rasmiy va chuqur</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">O&apos;zbek so&apos;mida moliya va narxlar</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Faqat Rubl/Valyuta</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> So&apos;m va valyuta</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Ombor (Partiyalar, kirim, FIFO tan narx)</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> To&apos;liq ERP ombor</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">O&apos;zbek tilidagi qulay interfeys</td>
                <td className="p-4 text-muted-foreground sm:px-6"><X className="size-4 text-rose-500 inline mr-1" /> Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6"><Check className="size-4 text-primary inline mr-1" /> O&apos;zbek va Rus tillarida</td>
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
        <h3 className="text-2xl font-bold">O&apos;zbekiston bozoriga moslashgan qudratli tizim</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats orqali savdo hajmingizni oshiring va raqobatchilardan bir qadam oldinda bo&apos;ling.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Hisob yaratish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
