import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, FileText, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Marketda Do'kon Ochish — 2026-Yilda Noldan Sotuv Boshlash Bo'yicha To'liq Yo'riqnoma | eStats",
  description:
    "Uzum Market'da rasmiy sotuvchi (seller) bo'lish: YaTT yoki MChJ ochish, kerakli hujjatlar, shartnoma imzolash, kabinetni sozlash va birinchi tovar partiyasini omborga topshirish bosqichlari.",
  keywords: [
    "uzumda dokon ochish",
    "uzum market seller bolish",
    "uzumda sotuv boshlash",
    "uzum shartnoma tuzish",
    "uzum yatt ochish",
    "uzum seller registratsiya",
  ],
  alternates: { canonical: "/qollanma/uzumda-dokon-ochish" },
  openGraph: {
    title: "Uzum Marketda Do'kon Ochish — Bosqichma-bosqich Qo'llanma",
    description: "2026-yilda Uzum Marketda muvaffaqiyatli savdo boshlashning barcha qadamlari.",
    url: "https://estats.uz/qollanma/uzumda-dokon-ochish",
  },
};

export default function OpenShopGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Qo'llanmalar", url: "/qollanma" },
          { name: "Uzumda do'kon ochish", url: "/qollanma/uzumda-dokon-ochish" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Rocket className="size-3.5" /> Boshlovchilar Uchun
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Marketda do&apos;kon ochish <span className="text-primary">to&apos;liq yo&apos;riqnomasi (2026)</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O&apos;zbekistonning eng yirik marketpleysida savdo boshlash uchun zarur bo&apos;lgan barcha huquqiy,
          moliyaviy va texnik talablar.
        </p>
      </header>

      <section className="space-y-8 rounded-3xl border bg-card p-6 sm:p-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">1-Qadam: Yuridik maqom (YaTT yoki MChJ)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Uzum Market faqat rasmiy ro&apos;yxatdan o&apos;tgan tadbirkorlar bilan ishlaydi. Jismoniy shaxs sifatida
            savdo qilish mumkin emas.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="size-4 text-primary shrink-0 mt-0.5" />
              <span><strong>YaTT (Yakka tartibdagi tadbirkor)</strong> — yangi boshlovchilar uchun eng maqbul yo&apos;l. Ro&apos;yxatdan o&apos;tish 30 daqiqa vaqt oladi.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Bank hisob raqami</strong> — Uzum tushumni har hafta to&apos;g&apos;ridan-to&apos;g&apos;ri hisob raqamingizga o&apos;tkazadi.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Elektron raqamli imzo (ERI)</strong> — E-imzo orqali shartnoma masofadan imzolanadi.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">2-Qadam: Uzum Seller kabinetida ro&apos;yxatdan o&apos;tish</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Rasmiy portalda anketani to&apos;ldirasiz: STIR (INN), bank rekvizitlari va aloqa ma&apos;lumotlari kiritiladi.
            Shartnoma tekshirilib tasdiqlangach (odatda 1-2 ish kuni), shaxsiy kabinetingiz faollashadi.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">3-Qadam: Tovar tanlash va Bozor tahlili</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hech qachon tovarni tavakkal sotib olmang. Tovarni xarid qilishdan oldin eStats bozor tahlili orqali:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span> Toifada qancha sotuvchi va qancha tovar borligini tekshiring.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span> Raqobatchilarning oylik savdo hajmini ko&apos;ring.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span> eStats komissiya kalkulyatori orqali sof foyda va marjangizni hisoblang.
            </li>
          </ul>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">4-Qadam: Tovarni omborga topshirish (Akt va Qadoqlash)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Har bir tovar uchun Uzum shtrix-kodi (barkod) chop etilib, qadoq ustiga yopishtiriladi.
            Kirim hujjati (nakladnoy) shakllantiriladi va tovar saralash markaziga yoki Uzum omboriga topshiriladi.
          </p>
        </div>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Do&apos;koningizni birinchi kundan professional boshqaring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats platformasi ombor, tan narx (FIFO) va reklamangizni avtomatik nazorat qilib beradi.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            eStats&apos;ni ulash <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
