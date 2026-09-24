import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Check, Layers, Package, ShieldCheck } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Ombor Dasturi — Qoldiqlar, Partiyalar va SKU Nazorati | eStats",
  description:
    "Uzum Market, Yandex Market, Wildberries va Ozon uchun professional ombor hisobi (Inventory ERP). Partiyalar bo'yicha kirim, tan narx, qoldiqlar ogohlantirishi va dublikat tovarlarni birlashtirish.",
  keywords: [
    "ombor dasturi",
    "sklad dasturi uzum",
    "marketplace ombor hisobi",
    "partiyalar hisobi",
    "tovar qoldiqlari nazorati",
    "ombor qoldig'i hisoblash",
    "sku nazorati",
    "fifo ombor dasturi",
  ],
  alternates: { canonical: "/yechimlar/ombor" },
  openGraph: {
    title: "Marketpleys Ombor Dasturi — Har bir partiya va tovar nazoratda",
    description:
      "Uzum va boshqa marketpleyslar uchun maxsus moslashtirilgan zamonaviy ombor boshqaruvi.",
    url: "https://estats.uz/yechimlar/ombor",
  },
};

const FAQ_ITEMS = [
  {
    question: "eStats ombor moduli marketpleys qoldiqlari bilan qanday bog'lanadi?",
    answer:
      "Do'koningiz ulangach, eStats barcha SKU va tovarlarni avtomatik tortadi. Siz har bir kirim partiyasi uchun tovar miqdori va sotib olish narxini kiritasiz. Sotuvlar sodir bo'lganda, qoldiqlar real vaqtda yangilanadi va FIFO bo'yicha hisobdan chiqariladi.",
  },
  {
    question: "Bir xil tovar ikkita kartochkada bo'lsa ombor qanday hisoblanadi?",
    answer:
      "eStats'da «Bir xil tovar» (Duplicate linking) funksiyasi mavjud. Agar bitta tovar bozorga ikki xil e'lon sifatida qo'yilgan bo'lsa, ularni bitta umumiy ombor zaxirasiga bog'lab qo'yishingiz mumkin. Bu omborda yo'q tovarni bordek hisoblash xatosini butunlay yo'q qiladi.",
  },
];

export default function WarehouseSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/ombor" },
          { name: "Ombor dasturi", url: "/yechimlar/ombor" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Boxes className="size-3.5" /> Ombor va Inventarizatsiya
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">mukammal ombor dasturi</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Qaysi tovar qancha qolgani, qaysi partiya qachon tugashi va ombordagi zaxiraning umumiy
          qiymatini real vaqtda ko&apos;rib boring.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Package className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Partiyalar nazorati</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Har bir kirim bo&apos;yicha sana, yetkazib beruvchi, miqdor va tan narxni alohida saqlang.
            Eski va yangi partiya narxlari aralashib ketmaydi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Layers className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Qoldiqlar ogohlantirishi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tovaringiz tugab qolish xavfi (Out of Stock) paydo bo&apos;lganda tizim sizni oldindan ogohlantiradi.
            Bozor reytingingiz tushib ketishiga yo&apos;l qo&apos;ymang.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <ShieldCheck className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Dublikat tovarlar birlashuvi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bitta tovar Uzum yoki WB da 2 marta qo&apos;yilgan bo&apos;lsa, ularni bitta omborga bog&apos;lab,
            haqiqiy umumiy qoldiqni aniq nazorat qilasiz.
          </p>
        </div>
      </div>

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

      <footer className="rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-card p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold sm:text-3xl text-foreground">
          Omboringizni bugunoq tartibga soling
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
          eStats orqali ortiqcha qog&apos;ozbozlik va adashishlarsiz aniq raqamlar bilan ishlang.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
        >
          Bepul boshlash <ArrowRight className="size-4" />
        </Link>
      </footer>
    </article>
  );
}
