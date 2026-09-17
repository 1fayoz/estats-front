"use client";

import * as React from "react";
import Link from "next/link";

import { Pagination, useServerPage } from "@/components/ui/pagination";
import { Grid, NoData, type Column } from "@/features/market/shared";
import { formatCompact, formatDate, formatNumber } from "@/lib/format";
import { MARKET_BASE } from "@/lib/market";

type Summary = {
  revenue: number | null;
  units: number | null;
  prev_revenue: number | null;
  prev_units: number | null;
  growth: number | null;
  units_growth: number | null;
  daily_revenue: number | null;
  total_revenue: number | null;
  total_units: number | null;
  first_day: string | null;
  last_day: string | null;
  days_with_sales: number | null;
  /** Davrda kelgan yangi sharhlar — sotuv bo'lganining aniq izi. */
  reviews_delta: number | null;
  last_measured: {
    day?: string; revenue?: number | null; units?: number | null;
    products?: number | null; products_with_sales?: number | null;
    stock?: number | null; reviews_delta?: number | null;
    /** Eng uzun o'lchov oralig'i va ko'p kunlik qatorlarning ulushi. */
    max_gap_days?: number | null;
    multi_day_share?: number | null;
  };
  period: { start: string; end: string; days: number };
};

type MonthRow = { month: string; revenue: number | null; units: number | null; days: number };

type Mover = {
  product_id: number;
  title: string;
  photo: string | null;
  category: string | null;
  shop: string | null;
  shop_id: number | null;
  revenue: number | null;
  units: number | null;
  prev_revenue: number | null;
  prev_units: number | null;
  delta: number | null;
  growth: number | null;
  share: number | null;
  stock: number | null;
  days_out: number | null;
  reviews_delta: number | null;
  rating: number | null;
};

const monthLabel = (value: string) => {
  const [year, month] = value.split("-");
  return `${month}.${year.slice(2)}`;
};

/**
 * Do'kon va sotuvchi uchun BITTA blok.
 *
 * Savol ikkalasida ham bir xil: kunlik, oylik va jami qancha
 * sotilyapti; qaysi kartochka olib boryapti; qaysi biri orqaga
 * tortyapti. Farqi faqat qamrovda — do'kon yoki yuridik shaxsning
 * hamma do'koni. Shuning uchun komponent ham bitta: ikki nusxa
 * interfeys ikki xil raqam ko'rsatishi muqarrar edi.
 *
 * "Eng ko'p tushgan" ro'yxati AYIRMA bo'yicha saralanadi, foiz
 * bo'yicha emas: 1000 so'mdan 300 ga tushish −70% beradi, lekin
 * do'kon uchun bu hech nima; 50 mln dan 35 mln ga tushish esa −30%,
 * va aynan shuni ko'rish kerak.
 */
export function ScopeAnalytics({
  kind,
  id,
  days,
  extraTiles = [],
}: {
  kind: "shops" | "sellers";
  id: string | number;
  days: number;
  /** Qamrovga xos qo'shimcha kartalar (masalan do'kon reytingi). */
  extraTiles?: { label: string; value: string; note?: string }[];
}) {
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [monthly, setMonthly] = React.useState<MonthRow[]>([]);
  const [top, setTop] = React.useState<Mover[]>([]);
  const [topTotal, setTopTotal] = React.useState(0);
  const [down, setDown] = React.useState<Mover[]>([]);
  const [failed, setFailed] = React.useState(false);
  // "Nima olib boryapti" — do'konning HAMMA kartochkasi, serverdan 15
  // tadan. Ilgari do'kon sahifasida bu yerdan tashqari davr keshidan
  // o'qiladigan alohida ro'yxat ham turardi va «Hozir yangilash» dan
  // keyin ikkalasi bir kartochkaga ikki xil tushum ko'rsatardi
  // (prodda: 2,8 mln va 4,2 mln). Endi ro'yxat BITTA.
  const topPage = useServerPage({ resetKey: [kind, id, days], param: "movers_page" });

  React.useEffect(() => {
    let alive = true;
    const base = `${MARKET_BASE}/${kind}/${id}`;
    Promise.all([
      getJson(`${base}/summary?days=${days}&months=12`),
      getJson(`${base}/movers?days=${days}&order=down&limit=10`),
    ])
      .then(([s, d]) => {
        if (!alive) return;
        setSummary(s.summary ?? null);
        setMonthly(s.monthly ?? []);
        setDown((d.items ?? []).filter((row: Mover) => (row.delta ?? 0) < 0));
        setFailed(false);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [kind, id, days]);

  React.useEffect(() => {
    let alive = true;
    getJson(
      `${MARKET_BASE}/${kind}/${id}/movers?days=${days}&order=revenue` +
        `&limit=${topPage.limit}&offset=${topPage.offset}`,
    )
      .then((t) => {
        if (!alive) return;
        setTop(t.items ?? []);
        setTopTotal(t.total ?? 0);
      })
      .catch(() => alive && setTop([]));
    return () => {
      alive = false;
    };
  }, [kind, id, days, topPage.limit, topPage.offset]);

  // Eski backendda bu yo'llar yo'q — blok jimgina yashiriladi,
  // sahifaning qolgani ishlayveradi.
  if (failed) return null;
  if (!summary) return <NoData>Yuklanmoqda…</NoData>;

  const last = summary.last_measured ?? {};

  const columns = (mode: "top" | "down"): Column<Mover>[] => [
    {
      key: "title",
      label: "Kartochka",
      align: "left",
      render: (row) => (
        <Link href={`/market/card?id=${row.product_id}`} className="flex items-center gap-2 hover:underline">
          {row.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.photo} alt="" className="size-8 shrink-0 rounded-md object-cover" />
          )}
          <span className="line-clamp-2 max-w-[22rem] text-left">{row.title}</span>
        </Link>
      ),
    },
    ...(kind === "sellers"
      ? [
          {
            key: "shop",
            label: "Do'kon",
            align: "left" as const,
            render: (row: Mover) =>
              row.shop_id ? (
                <Link href={`/market/shop?shop_id=${row.shop_id}`} className="hover:underline">
                  {row.shop ?? "—"}
                </Link>
              ) : (
                "—"
              ),
          },
        ]
      : []),
    {
      key: "revenue",
      label: "Tushum",
      render: (row) => <span className="air-num">{row.revenue != null ? formatCompact(row.revenue) : "—"}</span>,
    },
    {
      key: "share",
      label: "Ulush",
      render: (row) => (
        <span className="air-num text-muted-foreground">
          {row.share != null ? `${row.share}%` : "—"}
        </span>
      ),
    },
    {
      key: "units",
      label: "Sotildi",
      render: (row) => <span className="air-num">{row.units != null ? formatNumber(row.units) : "—"}</span>,
    },
    {
      key: "prev",
      label: "Oldingi davr",
      render: (row) => (
        <span className="air-num text-muted-foreground">
          {row.prev_revenue != null ? formatCompact(row.prev_revenue) : "—"}
        </span>
      ),
    },
    {
      key: "delta",
      label: mode === "down" ? "Tushish" : "O'zgarish",
      render: (row) => (
        <span
          className="air-num"
          style={{ color: (row.delta ?? 0) < 0 ? "var(--bad)" : (row.delta ?? 0) > 0 ? "var(--ok)" : undefined }}
        >
          {row.delta != null ? `${row.delta > 0 ? "+" : ""}${formatCompact(row.delta)}` : "—"}
        </span>
      ),
    },
    { key: "growth", label: "O'sish", render: (row) => <GrowthCell row={row} /> },
    {
      key: "stock",
      label: "Qoldiq",
      render: (row) => (
        <span className="air-num">
          {row.stock != null ? formatNumber(row.stock) : "—"}
          {(row.days_out ?? 0) > 0 && (
            <span className="ml-1 text-[11px] text-muted-foreground">
              · {row.days_out} kun tugagan
            </span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {/* "Kunlik" son har doim ham bir kunniki emas: kartochka bir
            necha kun o'lchanmay qolsa, ayirma keyingi o'lchovga to'liq
            tushadi. Buni yashirish yolg'on bo'lardi — prodda o'sha
            kungi tushumning 75% i 4 kunlik oraliqdan kelgan edi. */}
        <Tile
          label={last.day ? `Oxirgi o'lchov · ${formatDate(last.day)}` : "Oxirgi o'lchov"}
          value={last.revenue != null ? formatCompact(last.revenue) : "—"}
          note={last.units != null ? `${formatNumber(last.units)} dona` : "o'lchanmagan"}
          warn={
            (last.max_gap_days ?? 1) > 1 && (last.multi_day_share ?? 0) >= 5
              ? `${formatNumber(last.multi_day_share ?? 0)}% — ${last.max_gap_days} kungacha oraliqdan`
              : undefined
          }
        />
        <Tile
          label={`Davr (${summary.period.days} kun)`}
          value={summary.revenue != null ? formatCompact(summary.revenue) : "—"}
          note={
            summary.growth != null
              ? `oldingi davrga ${summary.growth > 0 ? "+" : ""}${summary.growth}%`
              : "oldingi davr bo'sh"
          }
        />
        <Tile
          label="Kunlik o'rtacha"
          value={summary.daily_revenue != null ? formatCompact(summary.daily_revenue) : "—"}
          note={`${formatNumber(summary.units ?? 0)} dona davrda`}
        />
        <Tile
          label="Jami (kuzatuv davri)"
          value={summary.total_revenue != null ? formatCompact(summary.total_revenue) : "—"}
          note={
            summary.first_day
              ? `${formatDate(summary.first_day)} dan beri`
              : "hali o'lchanmagan"
          }
        />
        <Tile
          label="Kartochkalar"
          value={last.products != null ? formatNumber(last.products) : "—"}
          note={
            last.products_with_sales != null
              ? `${formatNumber(last.products_with_sales)} tasi sotgan`
              : "—"
          }
        />
        <Tile
          label="Yangi sharhlar"
          value={summary.reviews_delta != null ? formatNumber(summary.reviews_delta) : "—"}
          note="davr ichida"
        />
        {extraTiles.map((tile) => (
          <Tile key={tile.label} label={tile.label} value={tile.value} note={tile.note} />
        ))}
      </div>

      {monthly.length > 0 && (
        <section className="space-y-2.5">
          <div className="font-semibold">Oylar bo&apos;yicha</div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Oy to&apos;liq o&apos;lchanmagan bo&apos;lishi mumkin — «o&apos;lchangan kun»
            ustuni shuni ochiq ko&apos;rsatadi. 3 kunlik oyni to&apos;liq oy bilan
            solishtirish xato bo&apos;lardi.
          </p>
          <Grid
            columns={[
              { key: "month", label: "Oy", align: "left", render: (r: MonthRow) => monthLabel(r.month) },
              { key: "revenue", label: "Tushum", render: (r: MonthRow) => <span className="air-num">{r.revenue != null ? formatCompact(r.revenue) : "—"}</span> },
              { key: "units", label: "Sotildi", render: (r: MonthRow) => <span className="air-num">{r.units != null ? formatNumber(r.units) : "—"}</span> },
              { key: "days", label: "O'lchangan kun", render: (r: MonthRow) => <span className="air-num text-muted-foreground">{r.days}</span> },
            ]}
            rows={monthly}
            rowKey={(r) => r.month}
          />
        </section>
      )}

      <section className="space-y-2.5">
        <div className="font-semibold">Nima olib boryapti</div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Hamma kartochkalar — davrdagi tushum bo&apos;yicha. «Ulush» — davrdagi jami
          tushumdagi hissasi, «O&apos;zgarish» — oldingi xuddi shunday uzunlikdagi
          davrga nisbatan.
        </p>
        <Grid
          columns={columns("top")}
          rows={top}
          rowKey={(r) => r.product_id}
          empty="Davrda sotuvi o'lchangan kartochka yo'q."
        />
        <Pagination page={topPage.page} total={topTotal} onPage={topPage.setPage} label="Kartochkalar sahifalari" />
      </section>

      <section className="space-y-2.5">
        <div className="font-semibold">Nima orqaga tortyapti</div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Oldingi davrga nisbatan eng ko&apos;p TUSHGAN kartochkalar — ayirma
          bo&apos;yicha, foiz bo&apos;yicha emas. Qoldiq tugagan kunlar alohida
          ko&apos;rsatiladi: ko&apos;pincha sabab aynan shu.
        </p>
        <Grid
          columns={columns("down")}
          rows={down}
          rowKey={(r) => r.product_id}
          empty="Tushib ketgan kartochka yo'q."
        />
      </section>
    </div>
  );
}

function getJson(url: string) {
  return fetch(url, { cache: "no-store" }).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
  );
}

/**
 * O'sish katagi — uch holat, uch ko'rinish.
 *
 * `null` foiz ikki xil sababdan chiqadi va ularni "yangi" deb bitta
 * yorliq bilan ko'rsatish yolg'on edi: bozor 11-sentabrdan yig'iladi,
 * ya'ni ko'p kartochkaning oldingi davri shunchaki O'LCHANMAGAN.
 */
function GrowthCell({ row }: { row: Mover }) {
  if (row.prev_revenue == null) {
    return (
      <span className="text-muted-foreground" title="Oldingi davr o'lchanmagan">
        —
      </span>
    );
  }
  if (row.growth == null) {
    return (row.revenue ?? 0) > 0 ? (
      <span className="text-[color:var(--ok)]" title="Oldingi davrda sotuv 0 edi">
        noldan
      </span>
    ) : (
      <span className="text-muted-foreground">0</span>
    );
  }
  return (
    <span
      className="air-num"
      style={{ color: row.growth < 0 ? "var(--bad)" : row.growth > 0 ? "var(--ok)" : undefined }}
    >
      {row.growth > 0 ? "+" : ""}
      {formatNumber(row.growth)}%
    </span>
  );
}

function Tile({
  label,
  value,
  note,
  warn,
}: {
  label: string;
  value: string;
  note?: string;
  /** Raqamning o'zi haqidagi ogohlantirish — yashirilmaydi. */
  warn?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="air-num mt-0.5 text-lg font-semibold">{value}</div>
      {note && <div className="mt-0.5 text-[11px] text-muted-foreground/80">{note}</div>}
      {warn && <div className="mt-0.5 text-[11px] text-[color:var(--warn)]">{warn}</div>}
    </div>
  );
}
