import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, ShieldCheck, Printer, Barcode } from "lucide-react";
import { BreadcrumbSchema, FaqSchema, HowToSchema } from "@/components/seo/structured-data";
import { BarcodeGeneratorTool } from "@/components/barcode-generator-tool";

export const metadata: Metadata = {
  title: "Uzum Market va Wildberries Shtrix-kod & Etiketka Generatori (58x40, 43x25) | eStats",
  description:
    "Uzum Market, Wildberries va Ozon uchun bepul shtrix-kod (Code-128, EAN-13) va termo-etiketka generatsiyasi. 58x40 mm, 43x25 mm o'lchamlarda darhol termoprinterga chiqarish.",
  keywords: [
    "uzum market shtrix kod generatsiya",
    "uzum etiketka chiqarish",
    "uzum shtrix kod olchami",
    "wildberries shtrix kod uzbekistan",
    "termo etiketka 58x40",
    "shtrix kod generator bepul",
    "uzum tovar stikeri",
    "ean 13 shtrix kod yaratish",
    "code 128 shtrix kod uzum",
    "xprinter etiketka chiqarish",
  ],
  alternates: {
    canonical: "/kalkulyator/shtrix-kod",
    languages: {
      uz: "/kalkulyator/shtrix-kod",
      ru: "/ru/kalkulyator/shtrix-kod",
      en: "/en/tools/barcode-generator",
    },
  },
  openGraph: {
    title: "Uzum va Wildberries Shtrix-kod & Etiketka Generatori — Bepul Onlayn",
    description: "58x40 mm termo-etiketkalar va shtrix-kodlarni bepul generatsiya qiling va chop eting.",
    url: "https://estats.uz/kalkulyator/shtrix-kod",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Market uchun qaysi etiketka o'lchami standart hisoblanadi?",
    answer:
      "Uzum Market qabul qilish punktlari va omborida eng keng tarqalgan standart o'lcham 58×40 mm (termo-etiketka) hisoblanadi. Mayda aksessuarlar uchun 43×25 mm, katta quti yoki postavka uchun esa 75×120 mm ishlatiladi.",
  },
  {
    question: "Shtrix-kod formati qanday bo'lishi kerak?",
    answer:
      "Uzum Market va Wildberries Code-128 va EAN-13 formatidagi shtrix-kodlarni qabul qiladi. Bizning generatorimiz har ikkala formatni ham 100% skanerlanadigan yuqori aniqlikda yaratadi.",
  },
  {
    question: "Termoprinter bo'lmasa oddiy printerda chiqarsa bo'ladimi?",
    answer:
      "Ha, A4 formatidagi o'ziyopishqoq qog'ozga (samokleyka) oddiy printerda ham chiqarishingiz mumkin. Ammo tezlik va qulaylik uchun Xprinter, TSC yoki HPRT kabi termo-printerlardan foydalanish tavsiya etiladi.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "Tovar ma'lumotlarini kiritish",
    text: "Mahsulot nomi, artikul (SKU) va shtrix-kod raqamini kiriting yoki avtomatik yangi EAN-13 generatsiya qiling.",
  },
  {
    name: "Etiketka o'lchamini tanlash",
    text: "O'zingizga kerakli o'lchamni (58×40 mm yoki 43×25 mm) tanlang.",
  },
  {
    name: "Termoprinterga chop etish",
    text: "Nusxalar sonini belgilang va 'Chop etish' tugmasi orqali termoprinteringizga to'g'ridan-to'g'ri yuboring.",
  },
];

export default function BarcodePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "Shtrix-kod generatori", url: "/kalkulyator/shtrix-kod" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />
      <HowToSchema
        name="Uzum Market uchun shtrix-kod va etiketka tayyorlash"
        description="Termoprinterda 58x40 mm etiketka chiqarish bo'yicha qadam-baqadam ko'rsatma"
        steps={HOW_TO_STEPS}
      />

      <BarcodeGeneratorTool locale="uz" />

      {/* SEO Content Section */}
      <section className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Uzum Market va Wildberries uchun tovarlarni to‘g‘ri markirovka qilish
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Marketpleyslarda sotuvni boshlashdagi eng muhim bosqichlardan biri bu tovarlarni FBO (omborga topshirish)
            yoki FBS (buyurtma tushganda topshirish) talablariga mos tarzda markirovkalashdir. Agar shtrix-kod sifatsiz
            bo‘lsa yoki ma’lumotlar to‘liq bo‘lmasa, ombor qabul qiluvchilari tovaringizni qabul qilmasligi (brak/vozvrat qilishi) mumkin.
          </p>
          <p>
            <strong>eStats Shtrix-kod Generatori</strong> orqali siz hech qanday murakkab grafik dasturlarsiz (CorelDraw, Photoshop)
            to‘g‘ridan-to‘g‘ri brauzer orqali tovarlaringizga professional stiker tayyorlashingiz va Xprinter, TSC, Godex
            kabi barcha standart termoprinterlarda bir zumda chop etishingiz mumkin.
          </p>
        </div>

        {/* CTA Box */}
        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Omboringizdagi minglab tovarlarni avtomatik hisobga oling
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xl">
              eStats platformasida barcha tovar qoldiqlari, partiyalar, tannarx (FIFO) va shtrix-kodlar yagona tizimda
              boshqariladi. Excel jadvallaridan butunlay voz keching.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            <span>Tizimga kirish</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
