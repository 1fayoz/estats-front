import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tariflar.
 *
 * Narxlar va tarkib o'zgarmagan — faqat ko'rinishi landing'ning
 * qolgan qismiga moslandi.
 */
const PLANS = [
  {
    name: "Demo",
    price: 0,
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
    unit: "so'm / oy",
    discount: "−30%",
    description: "Eng yaxshi tanlov",
    features: [
      "1 oylik tarifning hammasi",
      "Boost TOP plagin to'liq",
      "Avto monitoring boti (4 soat)",
      "Yo'qolgan mahsulotlar kuzatuvi",
      "Bo'lib to'lash imkoniyati",
      "Telegram bot premium",
    ],
    cta: "Eng mashhur",
    highlighted: true,
  },
  {
    name: "12 oy",
    price: 720_000,
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
    <section id="narxlar" className="border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Narxlar</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Sizga mos tarifni tanlang
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ko&apos;p oyga to&apos;lasangiz — kam to&apos;laysiz. Istalgan vaqtda
            kengaytirish mumkin.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                plan.highlighted
                  ? "border-transparent bg-foreground text-background shadow-xl"
                  : "bg-card"
              )}
            >
              {plan.discount ? (
                <span
                  className={cn(
                    "absolute right-5 top-5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    plan.highlighted ? "bg-background/15" : "bg-success/12 text-success"
                  )}
                >
                  {plan.discount}
                </span>
              ) : null}

              <span className="text-sm font-semibold">{plan.name}</span>
              <span
                className={cn(
                  "text-xs",
                  plan.highlighted ? "text-background/60" : "text-muted-foreground"
                )}
              >
                {plan.description}
              </span>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums">
                  {plan.price ? money.format(plan.price) : "0"}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    plan.highlighted ? "text-background/60" : "text-muted-foreground"
                  )}
                >
                  {plan.unit}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.highlighted ? "text-background/70" : "text-primary"
                      )}
                    />
                    <span
                      className={plan.highlighted ? "text-background/85" : "text-muted-foreground"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={cn(
                  "group mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                  plan.highlighted
                    ? "bg-background text-foreground hover:opacity-90"
                    : "border hover:bg-muted"
                )}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Narxlar so&apos;mda. To&apos;lov Payme, Click yoki bank o&apos;tkazmasi orqali.
        </p>
      </div>
    </section>
  );
}
