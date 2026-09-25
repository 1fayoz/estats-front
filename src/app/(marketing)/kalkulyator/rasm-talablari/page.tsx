import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { ImageSpecsCalculator } from "@/features/calculators/image-specs-calculator";

export const metadata: Metadata = {
  title: "Uzum Market va Wildberries Rasm O'lchamlari va Moderatsiya Qoidalari | eStats",
  description:
    "Uzum Market va Wildberries uchun tovar rasmi va infografika o'lchamlarini onlayn tekshiring: 3:4 proporsiya, 1200x1600 px ruxsat etilgan o'lcham, fon rangi va moderatsiya talablari.",
  keywords: [
    "uzum rasm olchamlari",
    "uzum infografika 3 4 proporsiya",
    "wildberries tovar rasmi olchami",
    "uzum moderatsiya qoidalari rasm",
    "1200x1600 tovar rasmi",
    "marketpleys foto formati tekshirgich",
  ],
  alternates: {
    canonical: "/kalkulyator/rasm-talablari",
    languages: {
      uz: "/kalkulyator/rasm-talablari",
      ru: "/ru/kalkulyator/rasm-talablari",
    },
  },
  openGraph: {
    title: "Marketpleys Foto va Infografika O'lchamlari Tekshirgichi — eStats",
    description: "Rasm eni va bo'yini kiritib, Uzum va WB moderatsiyasidan 100% o'tishini tekshiring.",
    url: "https://estats.uz/kalkulyator/rasm-talablari",
    images: ["https://estats.uz/api/og?title=Uzum+Rasm+va+Infografika+Olchamlari&badge=eStats+Tools"],
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Market uchun rasmning standart o'lchami qanday?",
    answer:
      "Uzum Marketda barcha tovar rasmlari qat'iy 3:4 proporsiyada bo'lishi shart. Minimal o'lcham 1080×1440 piksel, tavsiya etiladigan eng sifatli o'lcham esa 1200×1600 pikseldir.",
  },
  {
    question: "Asosiy rasm (oblojka) qanday fonga ega bo'lishi kerak?",
    answer:
      "Birinchi asosiy rasm toza oq (#FFFFFF) yoki neytral och kulrang fonda bo'lishi talab qilinadi. Bosh rasmda ortiqcha xonadon yoki do'kon fonlariga moderatsiya tomonidan ruxsat berilmaydi.",
  },
  {
    question: "Infografikaga nimalarni yozish taqiqlangan?",
    answer:
      "Rasm ustiga telefon raqamlari, Instagram/Telegram ssilkalar, 'Eng arzon', 'Super sifat' kabi tasdiqlanmagan shiorlar yoki narx yozish qat'iyan taqiqlanadi.",
  },
];

export default function ImageSpecsPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "Rasm va Infografika O'lchamlari", url: "/kalkulyator/rasm-talablari" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <ImageSpecsCalculator locale="uz" />
    </article>
  );
}
