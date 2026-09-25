import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { FboActGenerator } from "@/features/calculators/fbo-act-generator";

export const metadata: Metadata = {
  title: "Uzum Market va Wildberries FBO/FBS Qabul Qilish Akti (Nakladnaya) Generatori | eStats",
  description:
    "Omborga tovar topshirish uchun rasmiy qabul qilish-topshirish dalolatnomasini (nakladnaya) bepul onlayn to'ldiring va A4 formatda chop eting. Uzum FBO, FBS va postavka hujjatlari.",
  keywords: [
    "uzum fbo akt yaratish",
    "uzum nakladnaya generatsiya",
    "wildberries tovar topshirish akti",
    "fbo postavka hujjati uzum",
    "qabul qilish topshirish dalolatnomasi uzum",
    "omborga tovar topshirish hujjati",
  ],
  alternates: {
    canonical: "/kalkulyator/fbo-akt",
    languages: {
      uz: "/kalkulyator/fbo-akt",
      ru: "/ru/kalkulyator/fbo-akt",
    },
  },
  openGraph: {
    title: "Uzum va WB FBO/FBS Qabul Qilish Akti Generatori — eStats",
    description: "A4 formatdagi rasmiy tovar topshirish hujjatini bir necha soniyada tayyorlang.",
    url: "https://estats.uz/kalkulyator/fbo-akt",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Market omboriga tovar topshirishda akt shartmi?",
    answer:
      "Ha, tovarlar soni, qutilar va partiyalar xavfsizligi hamda kelgusida hisob-kitoblar to'g'ri chiqishi uchun qabul qilish-topshirish dalolatnomasi ikki nusxada chop etilib, bir nusxasi ombor xodimiga topshiriladi.",
  },
  {
    question: "FBO va FBS uchun hujjat farq qiladimi?",
    answer:
      "FBO da tovarlar markaziy omborga katta partiyada topshiriladi. FBS da esa faqat tushgan buyurtmalar qabul qilish punktiga (ПВЗ) kichik reestr asosida beriladi. Ushbu generator ikkala sxema uchun ham mos keladi.",
  },
];

export default function FboActPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "FBO/FBS Qabul qilish akti", url: "/kalkulyator/fbo-akt" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <FboActGenerator locale="uz" />
    </article>
  );
}
