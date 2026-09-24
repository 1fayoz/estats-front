import { Globe2 } from "lucide-react";

const MARKETS = [
  { name: "Uzum Market", country: "🇺🇿 O'zbekiston", color: "from-violet-500/20 to-purple-500/20" },
  { name: "Yandex Market", country: "🟡 Rossiya / MDH", color: "from-amber-500/20 to-yellow-500/20" },
  { name: "Wildberries", country: "🟣 Rossiya / MDH", color: "from-fuchsia-500/20 to-purple-500/20" },
  { name: "Ozon", country: "🔵 Rossiya / MDH", color: "from-sky-500/20 to-blue-500/20" },
  { name: "Kaspi", country: "🇰🇿 Qozog'iston", color: "from-rose-500/20 to-red-500/20" },
];

export function MarketplacesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold">Ko‘p bozorli (Multi-Marketplace) tahlil va boshqaruv</div>
              <div className="text-xs text-muted-foreground">
                Bir profil orqali barcha marketpleyslardagi savdo va tahlilni birlashtiring
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {MARKETS.map((m) => (
              <div
                key={m.name}
                className={`rounded-lg border bg-gradient-to-br ${m.color} px-3 py-1.5 text-xs font-semibold backdrop-blur`}
              >
                <span>{m.country}</span> · {m.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
