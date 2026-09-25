import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, DollarSign, Megaphone, Target, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Boost TOP Reklamani To'g'ri Sozlash — Budjetni 2x Tejang va Savdoni Oshiring | eStats",
  description:
    "Uzum Market Boost TOP ichki reklama tizimini samarali ishlatish bo'yicha to'liq qo'llanma: stavka qo'yish, DRR nazorati, foydasiz so'rovlarni o'chirish va ROI oshirish.",
  keywords: [
    "boost top uzum sozlash",
    "uzum reklama qollanma",
    "boost top tejamkorlik",
    "drr kamaytirish uzum",
    "uzum reklama strategiyasi",
    "uzum reklama tahlili",
  ],
  alternates: { canonical: "/qollanma/boost-top-sozlash" },
  openGraph: {
    title: "Boost TOP Reklamani Sozlash Qo'llanmasi — eStats",
    description: "Reklamangiz har doim foydaga ishlashi uchun amaliy qadamlar.",
    url: "https://estats.uz/qollanma/boost-top-sozlash",
  },
};

export default function BoostTopGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Qo'llanmalar", url: "/qollanma" },
          { name: "Boost TOP sozlash", url: "/qollanma/boost-top-sozlash" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Megaphone className="size-3.5" /> Reklama Strategiyasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Boost TOP reklamani <span className="text-primary">to&apos;g&apos;ri sozlash va tejash</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Reklamaga pul sochishni to&apos;xtating. Har bir so&apos;m investitsiya ko&apos;proq sof daromad keltirsin.
        </p>
      </header>

      <section className="space-y-8 rounded-3xl border bg-card p-6 sm:p-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">1. Qoidani o&apos;rnatish: DRR &lt; Marja</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Reklama boshlashdan oldin tovaringizning marjasini aniqlang. Agar tovar marjasi 20% bo&apos;lsa,
            reklamaga ketgan sarf (DRR) 12-15% dan oshmasligi kerak. eStats DRR kalkulyatori orqali buni
            har kuni kuzatib boring.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">2. Kichik stavkadan boshlash</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Birdaniga eng yuqori stavka qo&apos;ymang. Kichikroq stavka bilan boshlab, 24 soat ichida qancha
            ko&apos;rish va savdo keltirganini test qiling. Faqat savdo keltirayotgan tovarlarga stavkani bosqichma-bosqich oshiring.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">3. Kartochka tayyor bo&apos;lmasdan reklama yoqmang</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Agar tovaringizda yaxshi rasm, xaridorgir narx va kamida 3-5 ta ijobiy sharh bo&apos;lmasa, reklamaga
            sarflangan pul shunchaki havoga uchadi. Reklamani faqat tayyor va jozibador kartochkalarga yoqing.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">4. eStats Marketing Moduli bilan avtomatik nazorat</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            eStats platformasi qaysi kampaniyalar pulni yeb qo&apos;yayotganini va qaysi biri haqiqiy foyda
            keltirayotganini real vaqtda ko&apos;rsatadi. Samarasiz reklamalarni bir zumda to&apos;xtatishingiz mumkin.
          </p>
        </div>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">DRR ko&apos;rsatkichingizni hoziroq hisoblang</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Bepul kalkulyatorimiz orqali reklamangiz foyda yoki zararda ekanini bilib oling.
        </p>
        <div className="pt-2">
          <Link
            href="/kalkulyator/drr"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            DRR kalkulyatori <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
