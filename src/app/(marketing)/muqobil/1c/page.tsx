import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Database, Layers, ShieldCheck, Zap } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "1C va MoySklad Muqobili — Marketpleyslar Uchun Zamonaviy Bulutli Ombor va Moliya | eStats",
  description:
    "1C va MoySklad o'rniga yengil, tezkor va arzon muqobil. Qimmat dasturchilarsiz, serverlarsiz Uzum, Yandex, WB va Ozon hisobini yuritish. Partiyalar, FIFO tan narx, qoldiqlar va P&L.",
  keywords: [
    "1c muqobili",
    "1c uzum market",
    "1c sklad uzbekistan",
    "moysklad uzum",
    "moysklad muqobili",
    "marketpleys erp dasturi",
    "bulutli ombor dasturi",
    "sklad dasturi uzbekistan",
  ],
  alternates: { canonical: "/muqobil/1c" },
  openGraph: {
    title: "1C va MoySklad Muqobili — eStats Bulutli Ombor Platformasi",
    description: "Nega zamonaviy marketpleys sotuvchilari og'ir 1C tizimidan eStats'ga o'tishmoqda?",
    url: "https://estats.uz/muqobil/1c",
  },
};

const FAQ_ITEMS = [
  {
    question: "1C o'rniga eStats ishlatishning qanday tejamkorlik tomonlari bor?",
    answer:
      "1C o'rnatish uchun alohida server, qimmat litsenziyalar va doimiy oylik oladigan 1C dasturchisi kerak bo'ladi. eStats esa to'liq bulutda ishlaydi: hech narsa o'rnatish shart emas, har qanday kompyuter yoki telefondan brauzer orqali 1 daqiqada ish boshlaysiz. Xarajatlar 5-10 barobar kamayadi.",
  },
  {
    question: "Partiyalar va FIFO tan narxi 1C dagi kabi aniq hisoblanadimi?",
    answer:
      "Ha, eStats aynan marketpleyslar ehtiyojlariga moslashtirilgan FIFO tizimiga ega. Har bir partiya bo'yicha tovar narxi, bojxona/yetkazib berish xarajatlari kiritiladi va sotuvlar bo'yicha avtomatik hisobdan chiqariladi.",
  },
  {
    question: "Do'konga yangi tovar kelsa qanday kiritiladi?",
    answer:
      "Kirim (Intakes) bo'limida bir nechta klik bilan yangi tovar partiyasi kiritiladi. Tovar marketpleys kartochkasi bilan avtomatik bog'lanadi va qoldiqlar yangilanadi.",
  },
];

export default function OneCAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Muqobillar", url: "/muqobil/1c" },
          { name: "1C va MoySklad muqobili", url: "/muqobil/1c" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Database className="size-3.5" /> 1C & MoySklad Muqobili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          1C va MoySklad o&apos;rniga <span className="text-primary">yengil va zamonaviy bulutli ombor</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Qimmat serverlar va doimiy 1C dasturchisi to&apos;lovlaridan charchadingizmi? eStats bilan marketpleys
          tovarlari, partiyalar, tan narx va omborni bir necha daqiqada nazoratga oling.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Zap className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">1 daqiqada ishga tushadi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Oylarca davom etadigan murakkab 1C integratsiyasi o&apos;rniga API orqali do&apos;koningizni ulab, darhol
            foydalanishni boshlang.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Aniq FIFO va Partiyalar</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Har xil partiyalardan kelgan tovarlar alohida tan narx bilan hisoblanadi. Marketpleys komissiyalari
            va logistika xarajatlari avtomatik yechiladi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <ShieldCheck className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">10 barobar arzonroq</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Qimmat litsenziyalar, yangilanishlar va texnik xizmat ko&apos;rsatish uchun ortiqcha pul to&apos;lamang.
            Hamma narsa oylik qulay obunada.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 p-6 text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight">1C / MoySklad vs eStats</h2>
          <p className="text-xs text-muted-foreground mt-1">Marketpleys sotuvchisi nigohi bilan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 sm:px-6">Mezon</th>
                <th className="p-4 sm:px-6">1C / MoySklad</th>
                <th className="p-4 sm:px-6 text-primary">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 font-medium sm:px-6">Ulanish va sozlash vaqti</td>
                <td className="p-4 text-muted-foreground sm:px-6">Haftalar yoki oylar</td>
                <td className="p-4 font-semibold text-primary sm:px-6">1 daqiqa (Avtomatik)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Qo&apos;shimcha dasturchi talabi</td>
                <td className="p-4 text-muted-foreground sm:px-6">Doimiy 1C mutaxassisi kerak</td>
                <td className="p-4 font-semibold text-primary sm:px-6">Mutlaqo shart emas</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Marketpleys tashqi bozor tahlili</td>
                <td className="p-4 text-muted-foreground sm:px-6">Yo&apos;q</td>
                <td className="p-4 font-semibold text-primary sm:px-6">To&apos;liq o&apos;rnatilgan</td>
              </tr>
              <tr>
                <td className="p-4 font-medium sm:px-6">Uzum/WB avtomatik komissiya hisobi</td>
                <td className="p-4 text-muted-foreground sm:px-6">Qo&apos;lda modul yozish kerak</td>
                <td className="p-4 font-semibold text-primary sm:px-6">Standart tayyor modul</td>
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
        <h3 className="text-2xl font-bold">Omboringizni oson va zamonaviy boshqaring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bilan og&apos;ir tizimlardan voz keching va biznesingizni yengillashtiring.
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
