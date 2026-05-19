import { ArrowUp, ScanSearch, Search, Sparkles } from "lucide-react";

const CASES = [
  {
    icon: ScanSearch,
    badge: "Vaqt tejash",
    title: "2 soatlik tahlil — 10 soniyada",
    desc:
      "Mahsulotni qo'lda tekshirish 2 soat oladi. Photo Search bilan 10 soniyada Uzum kataloglaridan o'xshashlarni topib, raqobatchi narxlar va sotuvlarini ko'rasiz.",
    metric: "−99%",
    metricLabel: "vaqt",
    color: "from-cyan-500/15 to-card",
    iconColor: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: Search,
    badge: "Kontent optimizatsiyasi",
    title: "4 → 25 dona/kun · 1 hafta ichida",
    desc:
      "Karta tahlil qilindi: kuchsiz kalit so'zlar yuqori chastotali, talab darajasidagilarga almashtirildi. SEO o'zgarishidan keyin sotuvlar 6 barobar oshdi.",
    metric: "6×",
    metricLabel: "sotuv",
    color: "from-emerald-500/15 to-card",
    iconColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Sparkles,
    badge: "Mavsumiy nisha",
    title: "0 → 35 dona, organik #2 pozitsiya",
    desc:
      "Mavsumiy mahsulot (bayram dasturxon) MyStats orqali tanlangan. Raqobatchilar tarixi tahlil qilindi, kalit so'zlar tanlandi — 1-kundan sotuvlar, 7 kun ichida 35 dona.",
    metric: "#2",
    metricLabel: "organik",
    color: "from-fuchsia-500/15 to-card",
    iconColor: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
];

export function CasesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          Bizning keyslar
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Real <span className="gradient-text">natijalar</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Bizning foydalanuvchilar qanday qilib sotuvlarni o'sirayotgani haqida.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {CASES.map((c) => (
          <div
            key={c.title}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${c.color}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconColor}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="h-5 w-5" />
                  {c.metric}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.metricLabel}
                </div>
              </div>
            </div>
            <div className="mt-4 inline-block rounded-md bg-card/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {c.badge}
            </div>
            <h3 className="mt-3 text-base font-bold leading-tight">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
