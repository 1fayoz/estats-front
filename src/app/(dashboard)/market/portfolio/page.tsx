"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import {
  COLORS, Card, Empty, FilterBar, ReportPage, SourceNote, ZTable, fmt, useLoad, useParams,
} from "@/features/report/ui";
import { fetchPnl } from "@/lib/api";
import { report, type PortfolioRow } from "@/lib/report";

/*
  «X so'm bilan nima sotay» — byudjetga sig'adigan barg nishalar, imkoniyat balli bo'yicha.

  Zaxira puli = o'rtacha SOTAYOTGAN do'konning oylik sotuvi (dona) × o'rtacha narx ×
  tannarx ulushi. Ulush sotuvchining O'Z FIFO P&L'idan (oxirgi 90 kun, faqat tannarxi
  ma'lum tovarlar: tannarx ÷ savdo) — taxmin qilinmaydi; o'zgartirsa bo'ladi.
  Natija kafolat EMAS: o'rtacha raqobatchi qancha sotishi.
*/

const iso = (d: Date) => d.toISOString().slice(0, 10);

function useOwnCostShare(): number | null {
  const [share, setShare] = React.useState<number | null>(null);
  React.useEffect(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 89 * 86400_000);
    fetchPnl(iso(from), iso(to))
      .then((r) => {
        let gross = 0;
        let cogs = 0;
        for (const row of r.rows) {
          if (row.uncoveredQuantity || !row.gross || !row.cogs) continue;
          gross += row.gross;
          cogs += row.cogs;
        }
        setShare(gross > 0 ? cogs / gross : null);
      })
      .catch(() => setShare(null));
  }, []);
  return share;
}

export default function PortfolioPage() {
  const [params, setParams] = useParams({ budget: "5000000", share: "" });
  const own = useOwnCostShare();
  const sharePct = params.share ? Number(params.share) : own != null ? Math.round(own * 100) : 40;
  const budget = Number(params.budget) || 0;
  const ready = budget >= 100_000 && sharePct > 2 && sharePct < 95;
  const { data, error } = useLoad(
    () => (ready ? report.portfolio({ budget, cost_share: sharePct / 100, period: "d30" }) : Promise.resolve(null)),
    [budget, sharePct, ready],
  );

  return (
    <ReportPage>
      <FilterBar>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Byudjet, so&apos;m</span>
          <Input type="number" min={100000} step={500000} value={params.budget} style={{ width: 160 }}
                 onChange={(e) => setParams({ budget: e.target.value })} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Tannarx ulushi, %</span>
          <Input type="number" min={3} max={94} value={String(sharePct)} style={{ width: 90 }}
                 onChange={(e) => setParams({ share: e.target.value })} />
        </label>
        <span style={{ fontSize: 12, opacity: 0.75 }}>
          {params.share
            ? "qo'lda kiritilgan"
            : own != null
              ? "sizning 90 kunlik P&L'ingizdan (tannarxi ma'lum tovarlar)"
              : "P&L'da tannarx yo'q — 40% sukut, o'zgartiring"}
        </span>
      </FilterBar>
      <Card>
        {!ready ? <Empty>Byudjet kamida 100 000 so&apos;m, ulush 3–94%</Empty> : null}
        {error ? <Empty>{error}</Empty> : null}
        <ZTable<PortfolioRow>
          rows={data?.items ?? []}
          rowKey={(r) => r.path}
          height="calc(100vh - 300px)"
          empty={<Empty>Bu byudjetga sig&apos;adigan, balli bor nisha topilmadi</Empty>}
          columns={[
            { key: "path", title: "Nisha", value: (r) => r.path, width: "32%" },
            {
              key: "opportunity", title: "Imkoniyat", num: true, center: true, value: (r) => r.opportunity,
              render: (r) => (
                <span style={{ fontWeight: 600 }}
                      title={`Talab ${r.opportunity_parts.demand} · O'sish ${r.opportunity_parts.growth} · ` +
                             `Kirish ${r.opportunity_parts.entry} · Defitsit ${r.opportunity_parts.turnover} · ` +
                             `Raqobat ${r.opportunity_parts.competition ?? "o'lchanmagan"}`}>
                  {r.opportunity}
                </span>
              ),
              heat: COLORS.heatDeep,
            },
            { key: "capital", title: "Oylik zaxira puli", num: true, value: (r) => r.capital, format: fmt.money,
              heat: COLORS.heatLight },
            { key: "shop_units_month", title: "O'rtacha do'kon, dona/oy", num: true,
              value: (r) => r.shop_units_month, format: fmt.int },
            { key: "shop_revenue_month", title: "O'rtacha do'kon tushumi/oy", num: true,
              value: (r) => r.shop_revenue_month, format: fmt.compact, heat: COLORS.heatBlue },
            { key: "avg_price", title: "O'rtacha narx", num: true, value: (r) => r.avg_price, format: fmt.money },
            { key: "active_shops", title: "Sotayotgan do'konlar", num: true, value: (r) => r.active_shops,
              format: fmt.int },
            { key: "growth", title: "O'sish %", num: true, value: (r) => r.growth, format: fmt.pct(0) },
          ]}
        />
        {data?.formula ? <div style={{ fontSize: 12, opacity: 0.75, padding: "8px 4px" }}>{data.formula}</div> : null}
      </Card>
      <SourceNote meta={data?.meta ?? undefined} />
    </ReportPage>
  );
}
