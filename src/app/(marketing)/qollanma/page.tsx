import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Flame, HelpCircle, Lightbulb, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Sotuvchilari Uchun Qo'llanmalar va Yo'riqnomalar | eStats",
  description:
    "Uzum Market, Yandex Market va Wildberries'da muvaffaqiyatli savdo qilish bo'yicha bosqichma-bosqich qo'llanmalar, do'kon ochish, tovar kartochkasini SEO optimallashtirish va reklama sozlash yo'riqnomalari.",
  keywords: [
    "uzumda dokon ochish qollanma",
    "marketpleys qollanma",
    "uzum tovar kartochkasi qoidalari",
    "fbo fbs farqi qollanma",
    "boost top qollanma",
    "uzumda savdo qilish sirlari",
  ],
  alternates: { canonical: "/qollanma" },
  openGraph: {
    title: "Marketpleys Sotuvchilari Uchun Qo'llanmalar — eStats Bilimlar Bazasi",
    description: "Noldan professional sotuvchigacha bo'lgan amaliy yo'riqnomalar to'plami.",
    url: "https://estats.uz/qollanma",
  },
};

const GUIDES = [
  {
    title: "Uzum Marketda do'kon ochish bo'yicha to'liq qo'llanma (2026)",
    slug: "/qollanma/uzumda-dokon-ochish",
    category: "Boshlash",
    description:
      "Yuridik shaxs yoki YaTT ochish, shartnoma tuzish, tovarlarni ro'yxatdan o'tkazish va birinchi savdoni boshlash bosqichlari.",
  },
  {
    title: "Tovar kartochkasini qidiruvda TOP ga chiqaradigan qilib to'ldirish",
    slug: "/qollanma/kartochka-toldirish",
    category: "Tovar SEO",
    description:
      "Nom tanlash, kalit so'zlarni to'g'ri joylash, infografika tayyorlash va konversiyani 2 baravar oshirish sirlari.",
  },
  {
    title: "FBO yoki FBS: yangi boshlagan sotuvchiga qaysi biri ma'qul?",
    slug: "/qollanma/fbo-fbs-farqi",
    category: "Logistika",
    description:
      "Uzum omboriga topshirish (FBO) va o'z omboridan jo'natish (FBS) xarajatlari, afzalliklari va kamchiliklari taqqoslanishi.",
  },
  {
    title: "Boost TOP reklamani to'g'ri sozlash va budjetni tejash",
    slug: "/qollanma/boost-top-sozlash",
    category: "Marketing",
    description:
      "Reklama xarajatlarini nazorat qilish, DRR ni optimal ushlab turish va samarasiz so'rovlarni o'chirish bo'yicha qo'llanma.",
  },
  {
    title: "Uzumda kam raqobatli va bo'sh nishalarni topish formulasi",
    slug: "/qollanma/top-nishalar",
    category: "Bozor tahlili",
    description:
      "Qaysi tovarlarni olib kirish kerak, monopoliyani qanday aniqlash va xarid xavfini minimallashtirish yo'llari.",
  },
];

export default function GuidesHubPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Qo'llanmalar", url: "/qollanma" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" /> Bilimlar Markazi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleys sotuvchilari uchun <span className="text-primary">amaliy qo&apos;llanmalar</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Do&apos;kon ochish, tovar tanlash, kartochka optimizatsiyasi va reklama boshqaruvi bo&apos;yicha
          bosqichma-bosqich yo&apos;riqnomalar.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={guide.slug}
            className="group rounded-3xl border bg-card p-6 sm:p-8 space-y-3 transition-all hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {guide.category}
              </span>
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {guide.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{guide.description}</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-sm font-semibold text-primary">
              Qo&apos;llanmani o&apos;qish <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Bilimlarni darhol amalda qo&apos;llang</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats analitikasi bilan do&apos;koningiz savdolarini yangi cho&apos;qqiga olib chiqing.
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
