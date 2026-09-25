import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Rocket, ShieldCheck } from "lucide-react";
import { BreadcrumbSchema, FaqSchema, HowToSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Как открыть магазин на Uzum Market в 2026 году: Пошаговая Инструкция | eStats",
  description:
    "Полное практическое руководство: как зарегистрироваться селлером на Uzum Market, открыть ИП или ООО в Узбекистане, загрузить карточки, распечатать штрихкоды и сделать первую отгрузку.",
  keywords: [
    "как открыть магазин на uzum market",
    "регистрация селлера uzum 2026",
    "документы для uzum market",
    "стать продавцом uzum uz",
    "пошаговая инструкция uzum",
  ],
  alternates: {
    canonical: "/ru/qollanma/uzumda-dokon-ochish",
    languages: {
      uz: "/qollanma/uzumda-dokon-ochish",
      ru: "/ru/qollanma/uzumda-dokon-ochish",
    },
  },
  openGraph: {
    title: "Как открыть магазин на Uzum Market в 2026 году — eStats",
    description: "Пошаговый гайд от юридической регистрации до первых продаж.",
    url: "https://estats.uz/ru/qollanma/uzumda-dokon-ochish",
  },
};

const STEPS = [
  {
    name: "Регистрация юридического лица (ИП или ООО)",
    text: "Для торговли на Uzum Market требуется статус индивидуального предпринимателя (YaTT) или юридического лица (OOO/MChJ) в Узбекистане с расчетным счетом в сумах.",
  },
  {
    name: "Регистрация в кабинете продавца Uzum Seller",
    text: "Перейдите на seller.uzum.uz, заполните реквизиты компании, подпишите оферту с помощью ЭЦП (ERI kalit) и настройте профиль магазина.",
  },
  {
    name: "Создание карточек и маркировка штрихкодами",
    text: "Добавьте товары, загрузите качественные фото с инфографикой, укажите габариты и сгенерируйте штрихкоды формата Code-128 или EAN-13 (через наш бесплатный генератор этикеток).",
  },
  {
    name: "Формирование поставки и отгрузка на склад FBO",
    text: "Создайте заявку на поставку в личном кабинете, распечатайте акт приёма-передачи и доставьте промаркированные короба на распределительный склад маркетплейса.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Можно ли торговать на Uzum Market в качестве самозанятого?",
    answer:
      "На текущий момент для полноценной работы на маркетплейсе требуется оформление ИП (YaTT) или юридического лица (ООО) со счетом в банке Узбекистана.",
  },
  {
    question: "Сколько времени занимает проверка документов и модерация?",
    answer:
      "Обычно проверка документов и активация личного кабинета занимает от 1 до 3 рабочих дней.",
  },
];

export default function RussianOpenStoreGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструкции", url: "/ru/qollanma" },
          { name: "Как открыть магазин на Uzum", url: "/ru/qollanma/uzumda-dokon-ochish" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />
      <HowToSchema
        name="Как открыть магазин на Uzum Market в 2026 году"
        description="Пошаговая инструкция по старту продаж на маркетплейсе"
        steps={STEPS}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Rocket className="size-3.5" /> Пошаговый Гайд
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Как открыть магазин на <span className="text-primary">Uzum Market</span> в 2026 году
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Все этапы запуска успешного онлайн-магазина: от открытия расчетного счета и подготовки этикеток
          до первой прибыльной поставки.
        </p>
      </header>

      {/* Steps List */}
      <section className="space-y-6">
        {STEPS.map((step, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                {idx + 1}
              </span>
              <h2 className="text-lg font-bold text-foreground">{step.name}</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-10">
              {step.text}
            </p>
          </div>
        ))}
      </section>

      {/* Free Tools Banner */}
      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Рассчитайте комиссию и создайте штрихкоды бесплатно
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xl">
            Воспользуйтесь нашим бесплатным калькулятором комиссии Uzum и генератором термоэтикеток 58×40 мм перед закупкой товаров.
          </p>
        </div>
        <Link
          href="/ru/kalkulyator/shtrix-kod"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
        >
          <span>Генератор штрихкодов</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </article>
  );
}
