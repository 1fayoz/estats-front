"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Failed, Loading, NoData } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { MARKET_BASE } from "@/lib/market";

type Cell = { day: string; position: number | null; is_ad: boolean };
type Row = { product_id: number; title: string; shop: string | null; cells: Cell[] };
type Detail = {
  keyword: { id: number; text: string; url: string };
  history: { day: string; coverage: number | null; cards: number | null;
             top100_revenue: number | null }[];
};

const shortDay = (v: string) => {
  const [, m, d] = v.split("-");
  return `${d}.${m}`;
};

/**
 * O'rin katakchasining rangi.
 *
 * Yuqori o'rin — quyuqroq. Bu shunchaki bezak emas: 50 ustunli
 * matritsada raqamlarni birma-bir o'qib bo'lmaydi, ko'z esa rang
 * dog'ini darrov ilg'aydi — qaysi kartochka yuqorida turgani
 * bir qarashda ko'rinadi.
 */
function tone(position: number | null): string {
  if (position == null) return "";
  if (position <= 3) return "bg-emerald-500/25 font-semibold";
  if (position <= 10) return "bg-emerald-500/15";
  if (position <= 30) return "bg-amber-400/15";
  return "bg-muted";
}

export default function KeywordPositionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    Promise.all([
      fetch(`${MARKET_BASE}/seo/keywords/${id}`).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`Topilmadi (${r.status})`))),
      fetch(`${MARKET_BASE}/seo/keywords/${id}/positions?days=30`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([d, p]) => { setDetail(d); setRows(p); })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <Failed message={error} />;
  if (!detail) return <Loading />;

  // Ustunlar — HAMMA qatorda uchragan kunlar birlashmasi.
  // Faqat birinchi qatordan olinsa, boshqa kartochka o'lchangan,
  // lekin bu o'lchanmagan kun umuman ko'rinmay qolardi.
  const days = Array.from(new Set(rows.flatMap((r) => r.cells.map((c) => c.day)))).sort();
  const last = detail.history.at(-1);

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/market/seo"><ArrowLeft className="h-3.5 w-3.5" /> So&apos;rovlarga qaytish</Link>
      </Button>

      <PageHeader
        title={`«${detail.keyword.text}»`}
        description="Qaysi kartochka qaysi kuni nechanchi o'rinda turgan."
        actions={
          <Button variant="outline" size="sm" asChild>
            <a href={detail.keyword.url} target="_blank" rel="noreferrer">Uzumda qidirish</a>
          </Button>
        }
      />

      {last && (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
          {[
            ["Kunlik qamrov", last.coverage != null ? formatNumber(last.coverage) : "—"],
            ["Natijadagi kartochkalar", last.cards != null ? formatNumber(last.cards) : "—"],
            ["TOP-100 tushumi", last.top100_revenue != null ? formatCompact(last.top100_revenue) : "—"],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-card p-3.5">
              <div className="text-[11px] text-muted-foreground">{label}</div>
              <div className="air-num mt-0.5 text-lg font-semibold">{value}</div>
            </div>
          ))}
        </div>
      )}

      <p className="max-w-3xl text-sm text-muted-foreground">
        Katakdagi raqam — o&apos;sha kungi o&apos;rin. <b>·</b> «o&apos;lchandi, lekin
        ko&apos;rilgan chuqurlikda yo&apos;q» degani, bo&apos;sh katak esa «o&apos;sha
        kuni umuman o&apos;lchov bo&apos;lmagan». Uchalasini aralashtirish tarixni
        yolg&apos;on qiladi: o&apos;lchanmagan kunni «topilmadi» deb yozish grafikda
        bo&apos;lmagan qulash yasaydi.
      </p>

      {rows.length === 0 ? (
        <NoData>
          Bu so&apos;rov bo&apos;yicha hali o&apos;rin o&apos;lchanmagan.
        </NoData>
      ) : (
        <div className="air-table-wrap border">
          <table className="air-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Kartochka</th>
                <th style={{ textAlign: "left" }}>Do&apos;kon</th>
                {days.map((d) => <th key={d}>{shortDay(d)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const byDay = new Map(row.cells.map((c) => [c.day, c]));
                return (
                  <tr key={row.product_id}>
                    <td style={{ textAlign: "left" }}>
                      <Link href={`/market/products/${row.product_id}`}
                            className="text-primary hover:underline">
                        {row.title.length > 60 ? `${row.title.slice(0, 60)}…` : row.title}
                      </Link>
                    </td>
                    <td style={{ textAlign: "left" }}>{row.shop ?? "—"}</td>
                    {days.map((d) => {
                      const cell = byDay.get(d);
                      if (!cell) return <td key={d} className="text-muted-foreground/30">—</td>;
                      return (
                        <td key={d} className={`air-num ${tone(cell.position)}`}
                            title={cell.is_ad ? "Reklama o'rni" : undefined}>
                          {cell.position ?? <span className="text-muted-foreground">·</span>}
                          {cell.is_ad && <span className="ml-0.5 text-[9px] text-amber-600">R</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
