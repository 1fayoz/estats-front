import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Учет Склада и Остатков FBO / FBS для Маркетплейсов | eStats",
  description:
    "Облачная система складского учета для маркетплейсов в Узбекистане. Контроль остатков на складах Uzum, Wildberries, Yandex Market, учет партий по себестоимости и печать штрихкодов.",
  keywords: [
    "складской учет маркетплейс",
    "программа для склада узбекистан",
    "fbo fbs склад ташкент",
    "учет остатков товаров узбекистан",
    "партионный учет склад",
    "печать этикеток uzum",
  ],
  alternates: {
    canonical: "/ru/yechimlar/ombor",
    languages: {
      uz: "/yechimlar/ombor",
      ru: "/ru/yechimlar/ombor",
      en: "/en/solutions/inventory-management",
      "x-default": "/yechimlar/ombor",
    },
  },
  openGraph: {
    title: "Учет Склада FBO/FBS для Маркетплейсов — eStats",
    description: "Управляйте поставками, штрихкодами и остатками без ошибок и штрафов.",
    url: "https://estats.uz/ru/yechimlar/ombor",
    locale: "ru_RU",
  },
};

export default function RussianWarehouseSolutionPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Решения", url: "/ru" },
          { name: "Склад и остатки", url: "/ru/yechimlar/ombor" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Boxes className="size-3.5" /> Складская ERP
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Учет склада и поставок <span className="text-primary">FBO / FBS</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Забудьте о ручных записях в тетрадях и потерянных партиях. eStats контролирует каждый товар от момента закупки до вручения покупателю.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">1. Контроль точки перезаказа (Safety Stock)</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Система заранее предупредит вас о том, через сколько дней закончатся остатки ходового товара на складе Uzum с учетом текущей скорости продаж.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">2. Генерация штрихкодов и актов</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Создавайте накладные на поставку и печатайте термоэтикетки в правильном формате маркетплейса в один клик.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Наведите идеальный порядок на складе</h2>
          <p className="text-sm text-muted-foreground mt-1">Подключите складской модуль eStats прямо сейчас.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Начать учет</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
