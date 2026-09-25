import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BreadcrumbSchema, FaqSchema, HowToSchema } from "@/components/seo/structured-data";
import { BarcodeGeneratorTool } from "@/components/barcode-generator-tool";

export const metadata: Metadata = {
  title: "Генератор Штрихкодов и Термоэтикеток для Uzum и Wildberries (58х40) | eStats",
  description:
    "Бесплатный онлайн генератор штрихкодов Code-128 и EAN-13, печать термоэтикеток 58х40 мм и 43х25 мм для селлеров Uzum Market, Wildberries и Ozon в Узбекистане.",
  keywords: [
    "генератор штрихкодов uzum market",
    "печать термоэтикеток узбекистан",
    "этикетки 58х40 uzum",
    "штрихкод wildberries узбекистан",
    "печать на xprinter uzum",
    "генератор ean 13 онлайн",
    "маркировка товаров uzum",
    "генератор этикеток маркетплейс",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/shtrix-kod",
    languages: {
      uz: "/kalkulyator/shtrix-kod",
      ru: "/ru/kalkulyator/shtrix-kod",
      en: "/en/tools/barcode-generator",
    },
  },
  openGraph: {
    title: "Генератор Штрихкодов и Этикеток для Маркетплейсов — Бесплатно",
    description: "Печать термоэтикеток 58х40 мм для Uzum Market и Wildberries онлайн.",
    url: "https://estats.uz/ru/kalkulyator/shtrix-kod",
  },
};

const FAQ_ITEMS = [
  {
    question: "Какой стандартный размер этикетки на Uzum Market?",
    answer:
      "Основной и самый распространенный стандарт на складах Uzum Market — это термоэтикетка размером 58×40 мм. Для мелких аксессуаров допустим размер 43×25 мм, а для маркировки коробов поставки — 75×120 мм.",
  },
  {
    question: "Какой формат штрихкода использовать для Wildberries и Uzum?",
    answer:
      "Оба маркетплейса поддерживают стандарты Code-128 и EAN-13. Наш генератор формирует идеально контрастные векторные штрихкоды, которые моментально считываются любыми лазерными и 2D сканерами.",
  },
  {
    question: "Как распечатать этикетку на термопринтере?",
    answer:
      "Укажите параметры товара, выберите размер 58×40 мм, нажмите кнопку 'Печать' и выберите ваш термопринтер (например, Xprinter, TSC, Godex) без масштабирования (100%) и с нулевыми полями.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "Ввод данных товара",
    text: "Укажите наименование, артикул и значение штрихкода (или нажмите 'Сгенерировать код').",
  },
  {
    name: "Выбор формата",
    text: "Выберите нужный размер этикетки: 58×40 мм, 43×25 мм или короб 75×120 мм.",
  },
  {
    name: "Печать на термопринтере",
    text: "Укажите тираж и нажмите 'Печать' для моментального вывода на принтер.",
  },
];

export default function RussianBarcodePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Генератор штрихкодов", url: "/ru/kalkulyator/shtrix-kod" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />
      <HowToSchema
        name="Создание и печать термоэтикеток для Uzum Market"
        description="Пошаговая инструкция по маркировке товаров для маркетплейсов"
        steps={HOW_TO_STEPS}
      />

      <BarcodeGeneratorTool locale="ru" />

      {/* SEO Article Section */}
      <section className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Правила маркировки товаров для Uzum Market и Wildberries в Узбекистане
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Корректная маркировка — залог быстрой приемки товаров на склад маркетплейса (FBO) и отсутствия
            обезлички. Складские сканеры чувствительны к качеству печати, поэтому штрихкод должен иметь правильные
            пропорции и отступы безопасности (quiet zones).
          </p>
          <p>
            С помощью бесплатного сервиса <strong>eStats</strong> вам больше не нужно вручную верстать этикетки
            в графических редакторах. Создавайте штрихкоды онлайн и печатайте их на рулонных принтерах за считанные секунды.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Автоматизируйте учет всех остатков и штрихкодов
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xl">
              Платформа eStats объединяет складской учет, партионную себестоимость по FIFO и управление продажами
              на Uzum, Wildberries, Yandex Market и Ozon.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            <span>Попробовать бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
