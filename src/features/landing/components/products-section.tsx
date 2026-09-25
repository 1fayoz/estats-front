import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, PlugZap } from "lucide-react";

import base from "./landing.module.css";
import styles from "./landing-features.module.css";

export type ProductsLocale = "uz" | "ru" | "en";

const WORKFLOW_BY_LOCALE = {
  uz: {
    eyebrow: "Qanday boshlanadi?",
    title: "Uch qadam.\nTartibli kundalik ish.",
    lead: "Avval ma'lumotlarni ulang, keyin hisobni to'ldiring. eStats bilan ishlash shundan boshlanadi.",
    footnoteText: "O'z do'koningiz ma'lumotlari bilan boshlang.",
    footnoteCta: "Ishni boshlash",
    steps: [
      {
        number: "01",
        icon: PlugZap,
        label: "Ulash",
        title: "Do'koningizni ulang.",
        description: "Marketpleys integratsiyasini sozlang (Uzum, Yandex Market, Wildberries, Ozon). Tovarlar va sotuv ma'lumotlari kabinetingizga yig'iladi.",
        detail: "Boshlanish nuqtasi — Integratsiyalar",
      },
      {
        number: "02",
        icon: Boxes,
        label: "Hisob",
        title: "Kirim va tan narxni kiriting.",
        description: "Har bir kelgan partiyaning miqdori, narxi va sanasini saqlang. Foyda hisobi shu ma'lumotlarga tayanadi.",
        detail: "Har bir partiya alohida hisobda",
      },
      {
        number: "03",
        icon: BarChart3,
        label: "Kundalik ish",
        title: "Tahlil qiling. Keyin joylang.",
        description: "Foyda va qoldiqni kuzating, SEO tavsiyalarini tekshiring. Tayyor tovar postini ulangan tarmoqlarga yuboring.",
        detail: "Oxirgi qaror o'zingizda",
      },
    ],
  },
  ru: {
    eyebrow: "Как начать работу?",
    title: "Три простых шага.\nПорядок в бизнесе.",
    lead: "Сначала подключите магазины, затем укажите себестоимость. Так начинается системная работа с прибылью.",
    footnoteText: "Начните работу на данных своего магазина прямо сейчас.",
    footnoteCta: "Начать бесплатно",
    steps: [
      {
        number: "01",
        icon: PlugZap,
        label: "Подключение",
        title: "Подключите магазины.",
        description: "Настройте интеграцию по API (Uzum, Yandex Market, Wildberries, Ozon). Каталог и история продаж синхронизируются автоматически.",
        detail: "Раздел Интеграции",
      },
      {
        number: "02",
        icon: Boxes,
        label: "Учет",
        title: "Укажите себестоимость поставок.",
        description: "Фиксируйте количество и закупочную цену каждой партии. Система автоматически применит FIFO для расчета реальной прибыли.",
        detail: "Партионный складской учет",
      },
      {
        number: "03",
        icon: BarChart3,
        label: "Рост",
        title: "Анализируйте и развивайте продажи.",
        description: "Контролируйте остатки FBO/FBS, улучшайте карточки с помощью AI и отправляйте готовые посты в Telegram и Instagram.",
        detail: "Полный контроль в одном окне",
      },
    ],
  },
  en: {
    eyebrow: "How It Works",
    title: "Three clear steps.\nDaily operational order.",
    lead: "Connect your stores, log purchase costs, and track net profits with complete visibility.",
    footnoteText: "Get started with your actual live store catalog.",
    footnoteCta: "Get Started Free",
    steps: [
      {
        number: "01",
        icon: PlugZap,
        label: "Connect",
        title: "Connect your seller accounts.",
        description: "Set up API connections for Uzum, Wildberries, Yandex Market, and Ozon. Catalog data and sales history pull in automatically.",
        detail: "Starting point — Integrations",
      },
      {
        number: "02",
        icon: Boxes,
        label: "Costing",
        title: "Log batch purchase costs.",
        description: "Record batch dates, quantities, and landed unit costs. This enables accurate FIFO net margin calculation across orders.",
        detail: "Itemized batch ledger",
      },
      {
        number: "03",
        icon: BarChart3,
        label: "Operate",
        title: "Analyze and scale with confidence.",
        description: "Monitor safety stock thresholds, apply AI search optimizations, and broadcast marketing promotions to social channels.",
        detail: "Real-time decision making",
      },
    ],
  },
};

export function ProductsSection({ locale = "uz" }: { locale?: ProductsLocale }) {
  const content = WORKFLOW_BY_LOCALE[locale] || WORKFLOW_BY_LOCALE.uz;

  return (
    <section id="mahsulot" className={styles.workflow} aria-labelledby="workflow-title">
      <div className={base.container}>
        <div className={styles.workflowIntro}>
          <div>
            <p className={base.eyebrow}>{content.eyebrow}</p>
            <h2 id="workflow-title" className={base.sectionTitle}>
              {content.title.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </div>
          <p className={base.lead}>{content.lead}</p>
        </div>

        <ol className={styles.workflowSteps}>
          {content.steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className={styles.step}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <span className={styles.stepIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                </div>
                <p className={styles.stepLabel}>{step.label}</p>
                <h3>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                <div className={styles.stepDetail}>
                  <span />
                  {step.detail}
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.workflowFootnote}>
          <p>{content.footnoteText}</p>
          <Link href="/login" className={base.textLink}>
            {content.footnoteCta} <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
