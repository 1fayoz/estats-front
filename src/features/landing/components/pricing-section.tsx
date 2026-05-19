import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Demo",
    price: 0,
    monthly: "bepul",
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
    monthly: "/oy",
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
    monthly: "/oy",
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
    monthly: "/oy",
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

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          Tariflar
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Sizga mos <span className="gradient-text">tarifni tanlang</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Ko'p oyga to'lasangiz — kam to'laysiz. Istalgan vaqtda kengaytirish mumkin.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6 transition-all",
              plan.highlighted
                ? "border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-2xl shadow-primary/20 lg:scale-[1.04]"
                : "bg-card/60 backdrop-blur hover:border-primary/40 hover:shadow-lg"
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-info px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                ⭐ Eng yaxshi tanlov
              </div>
            )}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {plan.description}
                </div>
                {plan.discount && (
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {plan.discount}
                  </span>
                )}
              </div>
              <div className="mt-2 text-xl font-bold">{plan.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums">
                  {plan.price === 0 ? "0" : (plan.price / 1000).toFixed(0) + "k"}
                </span>
                <span className="text-xs text-muted-foreground">{plan.monthly}</span>
              </div>
              {plan.price > 0 && (
                <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                  {plan.price.toLocaleString("uz-UZ")} so'm
                </div>
              )}
            </div>

            <ul className="mb-6 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs">
                  <div
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                      plan.highlighted
                        ? "bg-primary text-primary-foreground"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={cn(
                "rounded-lg py-2.5 text-sm font-medium transition-all",
                plan.highlighted
                  ? "bg-gradient-to-r from-primary via-info to-primary bg-[length:200%_100%] text-white shadow-md hover:bg-right"
                  : "border bg-card hover:bg-accent"
              )}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-xl border bg-gradient-to-br from-primary/5 to-info/5 p-4 text-center text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
        Multi-market paket: <strong className="text-foreground">Uzum + Kaspi + Teez</strong> bir paketda
        — qo'shimcha 20% chegirma
      </div>
    </section>
  );
}
