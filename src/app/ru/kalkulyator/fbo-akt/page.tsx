import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { FboActGenerator } from "@/features/calculators/fbo-act-generator";

export const metadata: Metadata = {
  title: "Генератор Акта Приёма-Передачи FBO/FBS для Uzum Market и Wildberries | eStats",
  description:
    "Бесплатный онлайн генератор накладной и акта приёма-передачи партии товаров на склад маркетплейса в формате A4. Готовые шаблоны для селлеров Uzum Market, Wildberries и Ozon.",
  keywords: [
    "акт приема передачи uzum market",
    "накладная на склад uzum",
    "бланк поставки wildberries узбекистан",
    "генератор актов fbo fbs",
    "документы для поставки uzum",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/fbo-akt",
    languages: {
      uz: "/kalkulyator/fbo-akt",
      ru: "/ru/kalkulyator/fbo-akt",
    },
  },
  openGraph: {
    title: "Генератор Акта Приёма-Передачи для Маркетплейсов — eStats",
    description: "Формируйте и печатайте накладные поставки в формате A4 за секунды.",
    url: "https://estats.uz/ru/kalkulyator/fbo-akt",
  },
};

const FAQ_ITEMS = [
  {
    question: "Зачем распечатывать бумажный акт приёма-передачи на склад?",
    answer:
      "Акт подтверждает фактическую передачу количества мест (коробов) и единиц товара экспедитору или приемщику склада. При возникновении расхождений или утере подписанный акт служит официальным подтверждением поставки.",
  },
  {
    question: "Сколько экземпляров накладной требуется?",
    answer:
      "Стандартно распечатывается 2 экземпляра: один остается у приемщика склада маркетплейса, второй с подписью и штампом о приемке возвращается водителю или селлеру.",
  },
];

export default function RussianFboActPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Акт приёма-передачи FBO", url: "/ru/kalkulyator/fbo-akt" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <FboActGenerator locale="ru" />
    </article>
  );
}
