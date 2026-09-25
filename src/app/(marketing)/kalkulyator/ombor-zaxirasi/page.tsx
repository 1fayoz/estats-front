import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Check, Clock, ShieldAlert } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { InventoryReorderCalculator } from "@/features/calculators/inventory-reorder-calculator";

export const metadata: Metadata = {
  title: "Ombor Zaxirasini Rejalashtirish Kalkulyatori — Out of Stock'dan Himoya va Reorder Point | eStats",
  description:
    "Marketpleysda tovarlaringiz tugab qolmasligi uchun qachon va qancha yangi partiya buyurtma berish kerakligini onlayn hisoblang. Xavfsizlik zaxirasi (Safety Stock) va Reorder Point formulasi.",
  keywords: [
    "ombor zaxirasi hisoblash",
    "out of stock xavfi",
    "reorder point kalkulyator",
    "safety stock uzum",
    "tovar tugab qolishi",
    "zaxira rejalashtirish",
    "partiya buyurtma qilish vaqti",
  ],
  alternates: { canonical: "/kalkulyator/ombor-zaxirasi" },
  openGraph: {
    title: "Ombor Zaxirasini Rejalashtirish Kalkulyatori — eStats",
    description: "Uzum va boshqa bozorlarda reyting tushib ketmasligi uchun tovar zaxirasini aniq rejalang.",
    url: "https://estats.uz/kalkulyator/ombor-zaxirasi",
  },
};

const FAQ_ITEMS = [
  {
    question: "Nega tovarning omborda tugab qolishi (Out of Stock) xavfli?",
    answer:
      "Uzum Market va boshqa marketpleys algoritmlari qoldig'i 0 bo'lib qolgan tovar kartochkasining qidiruvdagi o'rnini keskin pasaytiradi. Siz oylab mehnat qilib TOP ga chiqargan tovaringiz 3 kunda qoldiqsiz qolsa, qidiruvning oxirgi sahifalariga tushib ketishi va qayta ko'tarish uchun yana katta reklama talab qilinishi mumkin.",
  },
  {
    question: "Reorder Point (Qayta buyurtma nuqtasi) nima?",
    answer:
      "Bu ombordagi tovarlar soni ma'lum chegaraga yetganda yangi partiyaga darhol buyurtma berish lozimligini bildiruvchi signal soni. U yetkazib berish muddati va kutilmagan kechikishlar xavfini to'liq qoplaydi.",
  },
];

export default function InventoryReorderCalculatorPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/ombor-zaxirasi" },
          { name: "Ombor zaxirasi kalkulyatori", url: "/kalkulyator/ombor-zaxirasi" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Boxes className="size-3.5" /> Inventarizatsiya
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">ombor zaxirasi kalkulyatori</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tovaringiz tugab qolib savdo to&apos;xtamasligi uchun qachon va qancha yangi partiyaga zakaz berish
          kerakligini professional hisoblab oling.
        </p>
      </header>

      <InventoryReorderCalculator />

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Zaxirani to&apos;g&apos;ri rejalashtirish foydalari</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Bozorda tovar tugab qolib organik reyting yo'qotilishining oldini olish",
            "Ortiqcha tovar olib kirib omborda muzlatib qo'ymaslik (muzlatilgan pul)",
            "Xitoy yoki ishlab chiqaruvchining yetkazib berishdagi kechikishlariga tayyor bo'lish",
            "Mavsumiy talab o'sishida eng ko'p sotuvchi do'kon bo'lib qolish",
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
        <h3 className="text-2xl font-bold">Omboringiz doimo nazorat ostida</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats ombor moduli barcha tovarlaringiz qoldiqlarini har soatda tekshirib, xavf tug&apos;ilganda Telegram
          orqali xabar beradi.
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
