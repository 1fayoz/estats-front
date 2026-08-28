"use client";

import * as React from "react";
import { History, Play, RefreshCw } from "lucide-react";

import { MARKET_TABS, ModuleTabs } from "@/components/air/module-tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Failed, Grid, Loading, type Column } from "@/features/market/shared";
import { formatNumber, formatPercent } from "@/lib/format";
import { market, type MarketCoverage, type MarketRun, type MarketState, type MarketTokenStatus } from "@/lib/market";

// Quvur qadamlari — tartib MUHIM va o'zgartirib bo'lmaydi:
// turkumsiz o'lchov yo'q, o'lchovsiz qoldiq yo'q, qoldiqsiz
// to'liq yig'indi yo'q.
const STAGES = [
  { id: "catalog", label: "Turkumlar", hint: "Uzum turkumlar daraxti" },
  { id: "snapshot", label: "O'lchov", hint: "Har nisha bo'ylab kartochkalar" },
  { id: "stock", label: "Qoldiq", hint: "Sotuvi bor tovarlarning qoldig'i va do'koni" },
  { id: "keywords", label: "Kalit so'zlar", hint: "Qidiruv so'rovlari va o'rinlar" },
  { id: "rollup", label: "Yig'indi", hint: "Do'kon / turkum / bozor kesimi" },
];

export default function MarketSourcePage() {
  const [token, setToken] = React.useState<MarketTokenStatus | null>(null);
  const [state, setState] = React.useState<MarketState | null>(null);
  const [coverage, setCoverage] = React.useState<MarketCoverage[]>([]);
  const [runs, setRuns] = React.useState<MarketRun[]>([]);
  const [value, setValue] = React.useState("");
  const [note, setNote] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(() => {
    Promise.all([market.tokenStatus(), market.coverage(30), market.runs(20), market.state()])
      .then(([t, c, r, s]) => { setToken(t); setCoverage(c); setRuns(r); setState(s); })
      .catch((e) => setError(e.message));
  }, []);

  React.useEffect(reload, [reload]);

  async function save() {
    setNote(null);
    try {
      await market.saveToken(value.trim());
      setValue("");
      // Token qaytdi — backend uzilib qolgan joydan O'ZI davom
      // ettiradi. Foydalanuvchi buni qo'lda so'ramasligi kerak:
      // u tokenni aynan shuning uchun kiritdi.
      setNote(
        "Token saqlandi. Uzilib qolgan kunlar tekshirilib, o'lchov o'sha joydan davom etadi.",
      );
      setTimeout(reload, 1500);
    } catch {
      setNote("Saqlanmadi — token to'g'ri ko'chirilganini tekshiring.");
    }
  }

  async function run(stage: string) {
    setNote(null);
    try {
      await market.mine(stage);
      setNote(`«${stage}» qadami fonda ishga tushdi. Holati pastdagi jadvalda.`);
      setTimeout(reload, 1500);
    } catch {
      setNote("Qadam ishga tushmadi.");
    }
  }

  const coverageColumns: Column<MarketCoverage>[] = [
    { key: "day", label: "Kun", align: "left", render: (r) => r.day },
    { key: "source", label: "Manba", align: "left", render: (r) => r.source },
    { key: "seen", label: "O'lchangan", render: (r) => <span className="air-num">{formatNumber(r.products_seen)}</span> },
    {
      key: "ratio", label: "To'liqlik",
      render: (r) => (
        <span className={`air-num ${r.ratio > 0.9 ? "air-ok" : "air-warn"}`}>
          {formatPercent(r.ratio * 100)}
        </span>
      ),
    },
    { key: "rolled", label: "Yig'ilgan", render: (r) => (r.rolled_up ? "ha" : <span className="text-muted-foreground">yo&apos;q</span>) },
  ];

  const runColumns: Column<MarketRun>[] = [
    { key: "day", label: "Kun", align: "left", render: (r) => r.day },
    { key: "stage", label: "Qadam", align: "left", render: (r) => r.stage },
    {
      key: "status", label: "Holat",
      render: (r) => (
        <span className={r.status === "done" ? "air-ok" : r.status === "failed" ? "air-bad" : "text-muted-foreground"}>
          {r.status}
        </span>
      ),
    },
    { key: "items", label: "Yozuv", render: (r) => <span className="air-num">{formatNumber(r.items)}</span> },
    { key: "requests", label: "So'rov", render: (r) => <span className="air-num">{formatNumber(r.requests)}</span> },
    { key: "error", label: "Xato", align: "left", render: (r) => (r.error ? <span className="air-bad">{r.error}</span> : "—") },
  ];

  if (error) return <Failed message={error} />;
  if (!token) return <Loading />;

  return (
    <div className="space-y-5">
      <ModuleTabs tabs={MARKET_TABS} />

      <PageHeader
        title="Ma'lumot manbai"
        description="Uzum katalog tokeni, qazib olish quvuri va kunlar to'liqligi."
        actions={
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="h-3.5 w-3.5" /> Yangilash
          </Button>
        }
      />

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div className="font-semibold">Uzum katalog tokeni</div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Uzum ochiq katalogni ham tokensiz bermaydi. Token <b>taxminan uch soat</b>{" "}
          yashaydi — muddati o&apos;tishi xato emas, kutilgan holat: quvur to&apos;xtaydi,
          yig&apos;ilgani saqlanadi va token yangilangach o&apos;sha joydan davom etadi.
          Token javobga ham, logga ham hech qachon chiqmaydi.
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="rounded-lg border px-2.5 py-1.5 text-xs font-medium"
            style={{
              color: !token.configured
                ? "var(--bad)"
                : token.likely_expired
                  ? "var(--warn)"
                  : "var(--ok)",
              borderColor: "currentColor",
            }}
          >
            {!token.configured ? "Kiritilmagan"
              : token.likely_expired ? `Muddati o'tgan bo'lishi mumkin · ${token.hint}`
              : `Yaroqli · ${token.hint}`}
          </span>
          <Input type="password" placeholder="Yangi token…" value={value}
                 onChange={(e) => setValue(e.target.value)} className="max-w-md" />
          <Button size="sm" onClick={save} disabled={!value.trim()}>Saqlash</Button>
        </div>
        {note && <div className="text-xs text-muted-foreground">{note}</div>}
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div className="font-semibold">Qazib olish quvuri</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s.id} className="rounded-lg border p-3">
              <div className="text-sm font-medium">{s.label}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{s.hint}</div>
              <Button size="sm" variant="outline" className="mt-2.5 w-full"
                      onClick={() => run(s.id)} disabled={!token.configured && s.id !== "rollup"}>
                <Play className="h-3 w-3" /> Ishga tushirish
              </Button>
            </div>
          ))}
        </div>
      </section>

      {state && (state.missing_days > 0 || (state.stale_days ?? 0) > 0) && (
        <section className="air-notice space-y-3 rounded-xl p-4">
          <div className="font-semibold">Uzilish topildi</div>
          <p className="max-w-3xl text-sm opacity-90">
            Ma&apos;lumot <b>{state.data_until}</b> kungacha yig&apos;ilgan.{" "}
            {state.missing_days > 0 && <>{formatNumber(state.missing_days)} kun tushib qolgan. </>}
            {(state.stale_days ?? 0) > 0 && (
              <>Oxirgi {formatNumber(state.stale_days ?? 0)} kun o&apos;lchanmagan. </>
            )}
            <br />
            <b>O&apos;tgan kunni tiklab bo&apos;lmaydi</b> — Uzum katalogida faqat hozirgi
            holat bor, ya&apos;ni o&apos;sha kungi narx, qoldiq va o&apos;rin qaytmaydi.
            Lekin sotuv <b>yo&apos;qolmaydi</b>: buyurtmalar soni to&apos;plangan raqam,
            uzilishdagi sotuv uzilishdan keyingi kunga tushadi va o&apos;sha kun necha
            kunlik ekani jadvalda ochiq ko&apos;rsatiladi.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              setNote(null);
              try {
                await market.backfill();
                setNote("Bo'shliqlar belgilanmoqda, yig'indi qayta hisoblanadi.");
                setTimeout(reload, 2000);
              } catch {
                setNote("To'ldirish ishga tushmadi.");
              }
            }}
          >
            <History className="h-3.5 w-3.5" /> Bo&apos;shliqlarni yopish
          </Button>
        </section>
      )}

      <section className="space-y-2.5">
        <div className="font-semibold">Kunlar to&apos;liqligi</div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Bozorda millionlab kartochka bor va bir kunda hammasini o&apos;lchab
          bo&apos;lmaydi. To&apos;liq bo&apos;lmagan kunni to&apos;liq deb o&apos;qish
          «bozor qulabdi» degan yolg&apos;on xulosa beradi — shuning uchun bu raqam
          yashirilmaydi.
        </p>
        <Grid columns={coverageColumns} rows={coverage} rowKey={(r) => `${r.day}-${r.source}`}
              empty="Hali hech qanday kun o'lchanmagan." />
      </section>

      <section className="space-y-2.5">
        <div className="font-semibold">Oxirgi yugurishlar</div>
        <Grid columns={runColumns} rows={runs} rowKey={(r) => r.id}
              empty="Quvur hali ishga tushmagan." />
      </section>
    </div>
  );
}
