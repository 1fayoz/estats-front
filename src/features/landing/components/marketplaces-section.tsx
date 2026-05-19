import { Globe2 } from "lucide-react";

const MARKETS = [
  { name: "Uzum Market", country: "🇺🇿 O'zbekiston", color: "from-violet-500/20 to-purple-500/20" },
  { name: "Kaspi", country: "🇰🇿 Qozog'iston", color: "from-rose-500/20 to-red-500/20" },
  { name: "Teez", country: "🌏 Markaziy Osiyo", color: "from-cyan-500/20 to-sky-500/20" },
  { name: "Yandex Market", country: "🇷🇺 Rossiya", color: "from-yellow-500/20 to-amber-500/20" },
];

export function MarketplacesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-2xl border bg-card/60 p-6 backdrop-blur">
        <div className="flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-bold">4 ta marketplace qo'llab-quvvatlanadi</div>
              <div className="text-xs text-muted-foreground">
                Bir profile bilan barcha bozorlarni boshqaring
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
