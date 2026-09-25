import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Eye, Flame, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Marketda Kam Raqobatli va Bo'sh Nishalarni Topish — 5 Ta Amaliy Qadam | eStats",
  description:
    "Uzum Market'da qaysi tovarlarni sotish eng daromadli? Monopoliyani aniqlash, talab o'sishini o'rganish va kam raqobatli bo'sh nishalarni topish formulasi.",
  keywords: [
    "uzumda qanday tovar sotish kerak",
    "bosh nishalar uzum",
    "eng kop sotiladigan tovarlar uzum",
    "tovar tanlash qollanma",
    "daromadli nishalar marketplace",
  ],
  alternates: { canonical: "/qollanma/top-nishalar" },
  openGraph: {
    title: "Uzumda Bo'sh Nishalarni Topish Formulasi — eStats Qo'llanma",
    description: "Kam raqobat va yuqori talabga ega tovarlarni oldindan aniqlang.",
    url: "https://estats.uz/qollanma/top-nishalar",
  },
};

export default function NicheFindingGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Qo'llanmalar", url: "/qollanma" },
          { name: "Bo'sh nishalarni topish", url: "/qollanma/top-nishalar" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="size-3.5" /> Bozor Razvedkasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzumda kam raqobatli va <span className="text-primary">bo&apos;sh nishalarni topish formulasi</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Boshqalar sotayotgan tovarga ko&apos;r-ko&apos;rona ergashmang. Yuqori marjali va talab katta bo&apos;lgan
          tovarlarni topishning 5 ta qoidasi.
        </p>
      </header>

      <section className="space-y-8 rounded-3xl border bg-card p-6 sm:p-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">1. Sotuvli kartochkalar ulushini tekshiring</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Agar toifada 1000 ta tovar bo&apos;lib, ularning atigi 100 tasi sotsa (10% ulush), bu yerda raqobat juda qattiq
            va xaridorlar faqat 1-2 sotuvchidan olyapti. Agar toifada sotuvli kartochkalar ulushi 40-50% dan yuqori bo&apos;lsa,
            bu yerda yangi sotuvchi ham bemalol ulush ola oladi.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">2. Monopoliyani aniqlash (Top-3 sotuvchi ulushi)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Toifadagi butun oylik tushumning 70% dan ortig&apos;ini 1-2 ta yirik do&apos;kon egallab olgan bo&apos;lsa,
            bu toifaga kirish xavfli. Daromad barcha sotuvchilar o&apos;rtasida tekis taqsimlangan nishalarni tanlang.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">3. Narx segmentatsiyasi</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Qaysi narx oralig&apos;ida xaridorlar eng ko&apos;p tovar sotib olyapti? Masalan, 50 000 - 100 000 so&apos;mlik
            segmentda tovar juda ko&apos;p, ammo 150 000 - 250 000 so&apos;mlik premium segment bo&apos;sh bo&apos;lishi mumkin.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">4. eStats Bozor Tahlili bilan avtomatlashtirish</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            eStats nishalar moduli barcha toifalarni skanerlab, avtomatik tarzda: «Kam raqobatli», «Yuqori talab»,
            «O&apos;sayotgan trend» belgisi bilan eng istiqbolli tovarlarni sizga chiqarib beradi.
          </p>
        </div>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Keyingi xit tovaringizni bugunoq toping</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bozor razvedkasi orqali butun bozorning yashirin imkoniyatlarini oching.
        </p>
        <div className="pt-2">
          <Link
            href="/yechimlar/bozor"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Bozor tahlili sahifasi <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
