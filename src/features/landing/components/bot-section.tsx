import { Bell, MessageCircle, Send, TrendingUp, RefreshCw } from "lucide-react";

const BOT_FEATURES = [
  {
    icon: TrendingUp,
    title: "Avto hisobotlar",
    desc: "Har 4 soatda sotuv, qoldiq va kontent o'zgarishlari",
  },
  {
    icon: Bell,
    title: "Bildirishnomalar",
    desc: "Yangi buyurtma, qoldiq tugashi, salbiy sharh",
  },
  {
    icon: RefreshCw,
    title: "Raqobatchilar kuzatuvi",
    desc: "Top do'konlar va ularning narx o'zgarishlari",
  },
];

export function BotSection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
            <MessageCircle className="h-3.5 w-3.5" />
            Telegram Bot
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Hisobotlaringiz <span className="gradient-text">cho'ntakda</span>
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Telegram bot orqali do'koningiz va raqobatchilarning holatini real vaqtda kuzatib boring.
            Hech qachon muhim o'zgarishni qoldirib ketmaysiz.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {BOT_FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-sm font-semibold">{f.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>

          <button className="mt-8 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-sky-600">
            <Send className="h-4 w-4" />
            @mystats_bot ga ulanish
          </button>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="overflow-hidden rounded-3xl border bg-gradient-to-b from-sky-500/10 to-transparent p-1.5 shadow-2xl">
            <div className="rounded-[20px] bg-card p-4">
              <div className="mb-3 flex items-center gap-2 border-b pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white">
                  <Send className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">eStats Bot</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    online
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <BotMessage>
                  📊 <strong>Kunlik hisobot · @techzone_uz</strong>
                  <br />
                  <br />
                  Sotuv: <strong>42 ta</strong> (+18%)
                  <br />
                  Daromad: <strong>34.2M so'm</strong>
                  <br />
                  Yangi buyurtma: 7 ta
                </BotMessage>
                <BotMessage>
                  ⚠️ <strong>Diqqat!</strong>
                  <br />
                  Qoldiq tugayapti:
                  <br />
                  Xiaomi Redmi Note 13 — 4 dona
                </BotMessage>
                <BotMessage>
                  📈 <strong>Yangi pozitsiya</strong>
                  <br />
                  "krossovka nike": #12 → <strong>#5</strong>
                </BotMessage>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
                Xabar yozing...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BotMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-xs leading-relaxed">
      {children}
    </div>
  );
}
