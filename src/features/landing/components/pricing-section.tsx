import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import shared from "./landing.module.css";
import styles from "./landing-pricing.module.css";
const PLANS = [
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
      "Uzum / Kaspi / Teez ulash mumkin",
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
];

const money = new Intl.NumberFormat("ru-RU");

export function PricingSection() {
  return (
    <section id="narxlar" className={styles.pricing} aria-labelledby="pricing-heading">
      <div className={shared.container}>
        <div className={styles.pricingHeader}>
          <div>
          <p className={shared.eyebrow}>Tariflar</p>
          <h2 id="pricing-heading" className={shared.sectionTitle}>
            Sizga mos tarifni tanlang
          </h2>
          </div>
          <p className={styles.pricingLead}>
            Avval imkoniyatlar bilan tanishing.
            Keyin ishingizga mos muddatni tanlang.
          </p>
        </div>

        <div className={styles.plans}>
          {PLANS.map((plan) => (
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
                <span>{plan.price ? plan.unit : "so'm · bepul"}</span>
              </div>
              <p className={styles.periodTotal}>
                {plan.months > 1
                  ? `${plan.months} oy hisobida ${money.format(plan.price * plan.months)} so'm`
                  : plan.months === 1 ? "Bir oylik foydalanish" : "Namuna ma'lumotlar bilan tanishish"}
              </p>
              <Link href="/login" aria-label={plan.price ? `${plan.name} tarifini tanlash` : "Demo bilan bepul boshlash"} className={cn(plan.highlighted ? shared.primaryButton : shared.secondaryButton, styles.planButton)}>
                {plan.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
              <div className={styles.featuresLabel}>Tarifga kiradi</div>
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
          <p>Narxlar so&apos;mda. To&apos;lov Payme, Click yoki bank o&apos;tkazmasi orqali.</p>
          <p>Davr summasi oylik narx × oylar soni bo&apos;yicha hisoblangan. Chegirmalar 1 oylik tarifga nisbatan yaxlitlangan.</p>
        </div>
      </div>
    </section>
  );
}
