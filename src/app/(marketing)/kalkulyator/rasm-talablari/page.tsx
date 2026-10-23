import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { ImageSpecsCalculator } from "@/features/calculators/image-specs-calculator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Uzum Market Rasm O'lchamlari va Talablari",
  description:
    "Uzum Market va Wildberries uchun tovar rasmi va infografika o'lchamlarini tekshiring: 3:4 proporsiya, 1200x1600 px, fon rangi va moderatsiya talablari.",
  path: "/kalkulyator/rasm-talablari",
  keywords: [
    "uzum rasm olchamlari",
    "uzum infografika 3 4 proporsiya",
    "wildberries tovar rasmi olchami",
    "uzum moderatsiya qoidalari rasm",
    "1200x1600 tovar rasmi",
    "marketpleys foto formati tekshirgich",
  ],
  ogTitle: "Marketpleys Foto va Infografika O'lchamlari Tekshirgichi — eStats",
  ogDescription: "Rasm eni va bo'yini kiritib, Uzum va WB moderatsiyasidan 100% o'tishini tekshiring.",
});

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
