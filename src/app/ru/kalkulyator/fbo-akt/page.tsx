import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { FboActGenerator } from "@/features/calculators/fbo-act-generator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Генератор Акта Приёма FBO/FBS для Uzum и WB",
  description:
    "Бесплатный генератор накладной и акта приёма-передачи товаров на склад маркетплейса в A4. Шаблоны для Uzum Market, Wildberries и Ozon.",
  path: "/ru/kalkulyator/fbo-akt",
  keywords: [
    "акт приема передачи uzum market",
    "накладная на склад uzum",
    "бланк поставки wildberries узбекистан",
    "генератор актов fbo fbs",
    "документы для поставки uzum",
  ],
  ogTitle: "Генератор Акта Приёма-Передачи для Маркетплейсов — eStats",
  ogDescription: "Формируйте и печатайте накладные поставки в формате A4 за секунды.",
});

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
