import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { FboActGenerator } from "@/features/calculators/fbo-act-generator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FBO/FBS Qabul Akti (Nakladnaya) Generatori",
  description:
    "Omborga tovar topshirish dalolatnomasini (nakladnaya) bepul onlayn to'ldiring va A4 formatda chop eting. Uzum FBO, FBS va postavka hujjatlari.",
  path: "/kalkulyator/fbo-akt",
  keywords: [
    "uzum fbo akt yaratish",
    "uzum nakladnaya generatsiya",
    "wildberries tovar topshirish akti",
    "fbo postavka hujjati uzum",
    "qabul qilish topshirish dalolatnomasi uzum",
    "omborga tovar topshirish hujjati",
  ],
  ogTitle: "Uzum va WB FBO/FBS Qabul Qilish Akti Generatori — eStats",
  ogDescription: "A4 formatdagi rasmiy tovar topshirish hujjatini bir necha soniyada tayyorlang.",
});

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
