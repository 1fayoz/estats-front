"use client";

import * as React from "react";
import Link from "next/link";

import { Card, Empty, ZTable, fmt, styles, useLoad, type Column } from "@/features/report/ui";
import { MARKET_BASE } from "@/lib/market";

type Mover = {
  product_id: number;
  title: string;
  shop: string | null;
  shop_id: number | null;
  revenue: number | null;
  units: number | null;
  prev_revenue: number | null;
  delta: number | null;
  growth: number | null;
  share: number | null;
  stock: number | null;
  days_out: number | null;
};

const UP = "#2e7d32";
const DOWN = "#c62828";

/**
 * «Nima olib boryapti» va «Nima orqaga tortyapti» — bitta kartada.
 *
 * Do'kon va sotuvchi hisobotida kartochkalar jadvali bor, lekin u
 * OLDINGI DAVR bilan solishtirmaydi: "bu karta 4 mln keltirdi" degan
 * son o'sayotgani yoki qulayotganini aytmaydi. Tushib ketgan kartani
 * topish esa aynan shu sahifada qilinadigan ish.
 *
 * Saralash AYIRMA bo'yicha, foiz bo'yicha emas: 1000 so'mdan 300 ga
 * tushish −70% beradi, lekin do'konga ta'siri yo'q; 50 mln dan 35 mln
 * ga tushish −30%, va aynan shuni ko'rish kerak.
 *
 * Oldingi davr `Period.previous` bilan bir xil ta'rifda: shu davr
 * uzunligida va unga tutash.
 */
export function MoversCard({
  kind,
  id,
  start,
  end,
  limit = 12,
}: {
  kind: "shops" | "sellers";
  id: number | string | null | undefined;
  start: string;
  end: string;
  limit?: number;
}) {
  const [mode, setMode] = React.useState<"revenue" | "down">("revenue");
  const { data, error } = useLoad<{ items: Mover[]; scope_revenue: number } | null>(
    () =>
      id
        ? fetch(
            `${MARKET_BASE}/${kind}/${id}/movers?start=${start}&end=${end}` +
              `&order=${mode}&limit=${limit}`,
            { cache: "no-store" },
          ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
        : Promise.resolve(null),
    [kind, id, start, end, mode, limit],
  );

  // Eski bozor xizmatida bu yo'l yo'q — karta jimgina yashiriladi,
  // sahifaning qolgani ishlayveradi.
  if (error) return null;

  const rows = (data?.items ?? []).filter((row) =>
    mode === "down" ? (row.delta ?? 0) < 0 : true,
  );

  const columns: Column<Mover>[] = [
    {
      key: "title",
      title: "Kartasi",
      sortable: false,
      render: (r) => (
        <Link className={styles.link} href={`/market/card?id=${r.product_id}`}>
          {r.title}
        </Link>
      ),
    },
    ...(kind === "sellers"
      ? [
          {
            key: "shop",
            title: "Do'kon",
            sortable: false,
            render: (r: Mover) =>
              r.shop_id ? (
                <Link className={styles.link} href={`/market/shop?shop_id=${r.shop_id}`}>
                  {r.shop ?? "-"}
                </Link>
              ) : (
                "-"
              ),
          } as Column<Mover>,
        ]
      : []),
    {
      key: "revenue",
      title: "Tushim (soʻm)",
      num: true,
      sortable: false,
      value: (r) => r.revenue,
      format: fmt.compact,
    },
    {
      key: "prev",
      title: "Oldingi davr",
      num: true,
      sortable: false,
      value: (r) => r.prev_revenue,
      format: fmt.compact,
    },
    {
      key: "delta",
      title: "O'zgarish",
      num: true,
      sortable: false,
      value: (r) => r.delta,
      format: (v) => (v == null ? "-" : `${v > 0 ? "+" : ""}${fmt.compact(v)}`),
      tone: (r) => ({ color: (r.delta ?? 0) < 0 ? DOWN : (r.delta ?? 0) > 0 ? UP : undefined }),
    },
    {
      key: "growth",
      title: "O'sish",
      num: true,
      sortable: false,
      // Uch holat, uch ko'rinish: oldingi davr o'lchanmagan ("-"),
      // noldan o'sish (foiz bilan ifodalanmaydi) va oddiy foiz.
      render: (r) =>
        r.prev_revenue == null
          ? "-"
          : r.growth == null
            ? (r.revenue ?? 0) > 0
              ? <span style={{ color: UP }}>noldan</span>
              : "-"
            : (
                <span style={{ color: r.growth < 0 ? DOWN : r.growth > 0 ? UP : undefined }}>
                  {r.growth > 0 ? "+" : ""}
                  {fmt.dec(1)(r.growth)}%
                </span>
              ),
    },
    {
      key: "share",
      title: "Ulush",
      num: true,
      sortable: false,
      value: (r) => r.share,
      format: (v) => (v == null ? "-" : `${fmt.dec(1)(v)}%`),
    },
    {
      key: "stock",
      title: "Qoldiq",
      num: true,
      sortable: false,
      render: (r) => (
        <span>
          {r.stock == null ? "-" : fmt.int(r.stock)}
          {(r.days_out ?? 0) > 0 ? (
            <span style={{ opacity: 0.6 }}> · {r.days_out} kun tugagan</span>
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className={styles.link}
            style={{ fontWeight: mode === "revenue" ? 700 : 400 }}
            onClick={() => setMode("revenue")}
          >
            Nima olib boryapti
          </button>
          <button
            type="button"
            className={styles.link}
            style={{ fontWeight: mode === "down" ? 700 : 400 }}
            onClick={() => setMode("down")}
          >
            Nima orqaga tortyapti
          </button>
        </span>
      }
    >
      {rows.length ? (
        <ZTable columns={columns} rows={rows} rowKey={(r) => r.product_id} height={180} />
      ) : (
        <Empty>
          {mode === "down"
            ? "Oldingi davrga nisbatan tushib ketgan karta yo'q."
            : "Davrda sotuvi o'lchangan karta yo'q."}
        </Empty>
      )}
    </Card>
  );
}
