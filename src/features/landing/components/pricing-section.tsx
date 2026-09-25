import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import shared from "./landing.module.css";
import styles from "./landing-pricing.module.css";

export type PricingLocale = "uz" | "ru" | "en";

interface PlanItem {
  name: string;
  price: number;
  months: number;
  unit: string;
  discount?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const PRICING_BY_LOCALE: Record<
  PricingLocale,
  {
    eyebrow: string;
    title: string;
    lead: string;
    plans: PlanItem[];
    notes1: string;
    notes2: string;
    featuresLabel: string;
    freeUnit: string;
    monthsSummary: (months: number, total: string) => string;
    oneMonthSummary: string;
    demoSummary: string;
  }
> = {
  uz: {
    eyebrow: "Tariflar",
    title: "Sizga mos tarifni tanlang",
    lead: "Avval imkoniyatlar bilan tanishing. Keyin ishingizga mos muddatni tanlang.",
    featuresLabel: "Tarifga kiradi",
    freeUnit: "so'm · bepul",
    monthsSummary: (m, tot) => `${m} oy hisobida ${tot} so'm`,
    oneMonthSummary: "Bir oylik foydalanish",
    demoSummary: "Namuna ma'lumotlar bilan tanishish",
    notes1: "Narxlar so'mda. To'lov Payme, Click yoki bank o'tkazmasi orqali.",
    notes2: "Davr summasi oylik narx × oylar soni bo'yicha hisoblangan. Chegirmalar 1 oylik tarifga nisbatan yaxlitlangan.",
    plans: [
      {
        name: "Demo",
        price: 0,
        months: 0,
        unit: "bepul",
        description: "Tanishish uchun",
        features: [
          "1 kunlik namuna ma'lumotlar",
          "Cheklangan analitika",
          "10 ta rasm qidirish",
          "Asosiy SEO statistika",
        ],
        cta: "Bepul boshlash",
        highlighted: false,
      },
      {
        name: "1 oy",
        price: 1_290_000,
        months: 1,
        unit: "so'm / oy",
        description: "Starter",
        features: [
          "To'liq nisha va mahsulot analitikasi",
          "Do'konlar va sotuvchilar profili",
          "SEO kalit so'zlar va pozitsiyalar",
          "Rasm qidiruvi (cheklanmagan)",
          "Barcha marketpleyslarni (Uzum, Yandex, WB, Ozon) ulash mumkin",
        ],
        cta: "Tanlash",
        highlighted: false,
      },
      {
        name: "6 oy",
        price: 900_000,
        months: 6,
        unit: "so'm / oy",
        discount: "−30%",
        description: "Yarim yillik reja",
        features: [
          "1 oylik tarifning hammasi",
          "Boost TOP plagin to'liq",
          "Avto monitoring boti (4 soat)",
          "Yo'qolgan mahsulotlar kuzatuvi",
          "Bo'lib to'lash imkoniyati",
          "Telegram bot premium",
        ],
        cta: "Tanlash",
        highlighted: true,
      },
      {
        name: "12 oy",
        price: 720_000,
        months: 12,
        unit: "so'm / oy",
        discount: "−44%",
        description: "Maksimal tejam",
        features: [
          "6 oylik tarifning hammasi",
          "Shaxsiy menejer",
          "Prioritet qo'llab-quvvatlash",
          "Bo'lib to'lash imkoniyati",
          "Yangi funksiyalarga erta kirish",
        ],
        cta: "Tanlash",
        highlighted: false,
      },
    ],
  },
  ru: {
    eyebrow: "Тарифные планы",
    title: "Выберите подходящий тариф",
    lead: "Прозрачные условия без скрытых доплат. Выберите период подписки, который подходит вашему магазину.",
    featuresLabel: "В тариф входит",
    freeUnit: "сум · бесплатно",
    monthsSummary: (m, tot) => `За ${m} месяцев: ${tot} сум`,
    oneMonthSummary: "Подписка на 1 месяц",
    demoSummary: "Демонстрационный доступ с примерами",
    notes1: "Все цены указаны в сумах (UZS). Оплата через Payme, Click, Uzum Pay или безналичным расчетом.",
    notes2: "Скидки рассчитаны относительно базовой стоимости 1 месяца. Продлевайте или меняйте тариф в любое время.",
    plans: [
      {
        name: "Демо",
        price: 0,
        months: 0,
        unit: "бесплатно",
        description: "Для ознакомления",
        features: [
          "Демонстрационные данные на 1 день",
          "Базовая аналитика ниш",
          "Поиск товаров по фото (до 10 шт.)",
          "Базовый SEO аудит карточек",
        ],
        cta: "Попробовать демо",
        highlighted: false,
      },
      {
        name: "1 месяц",
        price: 1_290_000,
        months: 1,
        unit: "сум / мес",
        description: "Стартовый план",
        features: [
          "Полная аналитика ниш и товаров",
          "Профили конкурентов и магазинов",
          "Ключевые слова и позиции карточек",
          "Поиск по фото без ограничений",
          "Подключение Uzum, Wildberries, Yandex, Ozon",
        ],
        cta: "Выбрать тариф",
        highlighted: false,
      },
      {
        name: "6 месяцев",
        price: 900_000,
        months: 6,
        unit: "сум / мес",
        discount: "−30%",
        description: "Оптимальный выбор",
        features: [
          "Все возможности месячного тарифа",
          "Полный доступ к плагину Boost TOP",
          "Telegram бот мониторинга (каждые 4 ч.)",
          "Уведомления о закончившемся товаре",
          "Возможность рассрочки",
          "Премиальный Telegram бот",
        ],
        cta: "Выбрать тариф",
        highlighted: true,
      },
      {
        name: "12 месяцев",
        price: 720_000,
        months: 12,
        unit: "сум / мес",
        discount: "−44%",
        description: "Максимальная выгода",
        features: [
          "Все возможности полугодового тарифа",
          "Персональный менеджер поддержки",
          "Приоритетная техподдержка",
          "Гибкая рассрочка платежа",
          "Ранний доступ ко всем новинкам",
        ],
        cta: "Выбрать тариф",
        highlighted: false,
      },
    ],
  },
  en: {
    eyebrow: "Pricing Plans",
    title: "Select your subscription plan",
    lead: "Simple, transparent pricing. Choose the billing period that fits your business goals.",
    featuresLabel: "Included features",
    freeUnit: "UZS · Free",
    monthsSummary: (m, tot) => `${tot} UZS billed for ${m} months`,
    oneMonthSummary: "Standard 1 month plan",
    demoSummary: "Interactive demo with sample data",
    notes1: "Prices in Uzbek Soum (UZS). Secure payments via Payme, Click, Uzum Pay, or direct bank transfer.",
    notes2: "Discounts calculated relative to standard monthly pricing. Switch or upgrade plans anytime.",
    plans: [
      {
        name: "Free Demo",
        price: 0,
        months: 0,
        unit: "free",
        description: "Feature exploration",
        features: [
          "1-day sample dataset",
          "Basic niche intelligence",
          "Image search (up to 10 scans)",
          "Core listing SEO metrics",
        ],
        cta: "Start Free Demo",
        highlighted: false,
      },
      {
        name: "1 Month",
        price: 1_290_000,
        months: 1,
        unit: "UZS / mo",
        description: "Starter",
        features: [
          "Full niche and product intelligence",
          "Store and seller analytics profiles",
          "SEO rank tracking & keyword volume",
          "Unlimited image reverse lookup",
          "Multi-channel: Uzum, WB, Yandex, Ozon",
        ],
        cta: "Choose Plan",
        highlighted: false,
      },
      {
        name: "6 Months",
        price: 900_000,
        months: 6,
        unit: "UZS / mo",
        discount: "−30%",
        description: "Most Popular",
        features: [
          "Everything in 1-month plan",
          "Boost TOP advertising extension",
          "Automated monitoring bot (every 4h)",
          "Out-of-stock anomaly tracking",
          "Split-payment installment option",
          "Premium Telegram assistant",
        ],
        cta: "Choose Plan",
        highlighted: true,
      },
      {
        name: "12 Months",
        price: 720_000,
        months: 12,
        unit: "UZS / mo",
        discount: "−44%",
        description: "Maximum Value",
        features: [
          "Everything in 6-month plan",
          "Dedicated account success manager",
          "Priority 24/7 technical support",
          "Quarterly installment billing",
          "Early access to beta features",
        ],
        cta: "Choose Plan",
        highlighted: false,
      },
    ],
  },
};

const money = new Intl.NumberFormat("ru-RU");

export function PricingSection({ locale = "uz" }: { locale?: PricingLocale }) {
  const content = PRICING_BY_LOCALE[locale] || PRICING_BY_LOCALE.uz;

  return (
    <section id="narxlar" className={styles.pricing} aria-labelledby="pricing-heading">
      <div className={shared.container}>
        <div className={styles.pricingHeader}>
          <div>
            <p className={shared.eyebrow}>{content.eyebrow}</p>
            <h2 id="pricing-heading" className={shared.sectionTitle}>
              {content.title}
            </h2>
          </div>
          <p className={styles.pricingLead}>{content.lead}</p>
        </div>

        <div className={styles.plans}>
          {content.plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(styles.plan, plan.highlighted && styles.highlighted)}
              aria-label={`${plan.name} tarifi`}
            >
              <div className={styles.planHeading}>
                <h3>{plan.name}</h3>
                {plan.discount && <span className={styles.discount}>{plan.discount}</span>}
              </div>
              <p className={styles.planDescription}>{plan.description}</p>
              <div className={styles.price}>
                <span>{money.format(plan.price)}</span>
                <span>{plan.price ? plan.unit : content.freeUnit}</span>
              </div>
              <p className={styles.periodTotal}>
                {plan.months > 1
                  ? content.monthsSummary(plan.months, money.format(plan.price * plan.months))
                  : plan.months === 1
                  ? content.oneMonthSummary
                  : content.demoSummary}
              </p>
              <Link
                href="/login"
                aria-label={plan.name}
                className={cn(plan.highlighted ? shared.primaryButton : shared.secondaryButton, styles.planButton)}
              >
                {plan.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
              <div className={styles.featuresLabel}>{content.featuresLabel}</div>
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className={styles.pricingNotes}>
          <p>{content.notes1}</p>
          <p>{content.notes2}</p>
        </div>
      </div>
    </section>
  );
}
