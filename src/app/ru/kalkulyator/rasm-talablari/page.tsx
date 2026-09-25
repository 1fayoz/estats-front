import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { ImageSpecsCalculator } from "@/features/calculators/image-specs-calculator";

export const metadata: Metadata = {
  title: "Требования к Размерам Фото и Инфографики Uzum Market и Wildberries | eStats",
  description:
    "Онлайн проверка параметров фото для маркетплейсов Uzum Market, Wildberries и Ozon: пропорции 3:4, минимальное разрешение 1080x1440, белый фон и правила модерации.",
  keywords: [
    "размеры фото uzum market",
    "пропорция фото 3 4 вайлдберриз",
    "требования к инфографике uzum",
    "разрешение 1200х1600 маркетплейс",
    "модерация фото карточки товара",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/rasm-talablari",
    languages: {
      uz: "/kalkulyator/rasm-talablari",
      ru: "/ru/kalkulyator/rasm-talablari",
    },
  },
  openGraph: {
    title: "Проверка Размеров Фото и Инфографики Маркетплейсов — eStats",
    description: "Проверьте пропорцию 3:4 и разрешение фото для 100% прохождения модерации.",
    url: "https://estats.uz/ru/kalkulyator/rasm-talablari",
    images: ["https://estats.uz/api/og?title=Размеры+Фото+и+Инфографики+Uzum&badge=eStats+Инструменты"],
  },
};

const FAQ_ITEMS = [
  {
    question: "Каковы точные требования к размерам фото на Uzum Market?",
    answer:
      "На маркетплейсе Uzum строго действует вертикальный формат 3:4. Минимально допустимый размер — 1080×1440 px, рекомендуемый эталон — 1200×1600 px.",
  },
  {
    question: "Каким должен быть фон главного изображения?",
    answer:
      "Первое (главное) фото карточки обязательно должно быть на чистом белом (#FFFFFF) или нейтральном светло-сером фоне. Бытовые интерьеры не допускаются.",
  },
  {
    question: "Что запрещено размещать на инфографике?",
    answer:
      "Запрещено указывать номера телефонов, ссылки на соцсети, водяные знаки, цены в сумах/рублях и непроверенные надписи вроде 'Хит продаж' или 'Топ 1'.",
  },
];

export default function RuImageSpecsPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Размеры фото и инфографики", url: "/ru/kalkulyator/rasm-talablari" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <ImageSpecsCalculator locale="ru" />
    </article>
  );
}
