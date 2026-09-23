"use client";

import * as React from "react";
import Link from "next/link";

import type { ProductRow, SkuRow } from "@/lib/report";

import { COLORS, fmt, styles, type Column } from "./ui";

/*
  «kartochka asosida», «SKU asosida», «Sotuvchining SKUlari» ustunlari.

  Rang qoidalari tashqi xizmat jadvalidan ko'chirildi:
    · «Tushim» — och ko'k fon (heatmap);
    · «Yo'qotilgan foyda» — qizil matn;
    · «Bust mavjud kunlar» — binafsha heatmap;
    · «Stokda mavjud kunlar» — davrning hamma kunida bo'lsa ko'k, kam bo'lsa qizil;
    · «Reyting» — 4,9+ yashil, 4,5 dan past qizil.
*/

function Thumb({ id, src }: { id: number; src: string | null }) {
  return (
    <a href={`https://uzum.uz/uz/product/${id}`} target="_blank" rel="noreferrer">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={styles.thumb} loading="lazy" />
      ) : <span className={styles.muted}>↗</span>}
    </a>
  );
}

// Looker jadvalidagi shartli ranglar (1 kun va 30 kun eksport ekranlarida
// o'lchangan): reyting 4,9+ yashil, 4,5 va past qizil; «Stokda mavjud kunlar»
// 30 va undan ko'p — ko'k, kam — qizil (davr uzunligiga qaramaydi: 1 kunlik
// davrda ham «1» qizil); yo'qotilgan foyda faqat noldan katta bo'lsa qizil.
const ratingTone = (rating: number | null) =>
  rating == null ? undefined : rating >= 4.9 ? { color: "var(--ok, var(--success))" } : rating <= 4.5 ? { color: "var(--bad, var(--destructive))" } : undefined;
const lostTone = (value: number | null) => (value ? { color: "var(--bad, var(--destructive))" } : undefined);
const stockDaysTone = (value: number | null) =>
  value == null ? undefined : value >= 30 ? { color: "var(--primary)" } : { color: "var(--bad, var(--destructive))" };

export function productColumns(periodDays: number | null): Column<ProductRow>[] {
  return [
    // Hisobot jadvalining BIRINCHI ustuni — kartochkaning Uzum'dagi raqami.
    { key: "product_id", title: "product_id", sortable: false, width: 74,
      render: (r) => <span className={styles.muted}>{r.product_id}</span> },
    { key: "image", title: "Uzum↗", sortable: false, width: 44, render: (r) => <Thumb id={r.product_id} src={r.image} /> },
    { key: "category", title: "Toifa 4", sortable: false, width: 90, render: (r) => r.category ?? "-" },
    {
      key: "shop", title: "Do'kon↗", sortable: false, width: 80,
      render: (r) => r.shop_id ? <Link className={styles.link} href={`/market/shop?shop_id=${r.shop_id}`}>{r.shop}</Link>
        : <span className={styles.link}>{r.shop}</span>,
    },
    {
      key: "title", title: "Kartochka (ZS) ↗", sortable: false, width: 150,
      render: (r) => <Link className={styles.link} href={`/market/card?id=${r.product_id}`}>{r.title}</Link>,
    },
    { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, heat: COLORS.heatLight },
    { key: "growth", title: "O'sish %", num: true, value: (r) => r.growth, format: fmt.pct(0, true) },
    { key: "lost_revenue", title: "Yo'qotilgan foyda", num: true, value: (r) => r.lost_revenue, format: fmt.compact0,
      tone: (r) => lostTone(r.lost_revenue) },
    { key: "units", title: "Sotuv, donada", num: true, value: (r) => r.units },
    { key: "daily_units", title: "Kunlik sotuv (dona)", num: true, value: (r) => r.daily_units, format: fmt.dec(2) },
    { key: "avg_price", title: "O'rtacha narx", num: true, value: (r) => r.avg_price },
    { key: "fbs_days", title: "FBS dagi kunlar", num: true, value: (r) => r.fbs_days },
    { key: "boost_days", title: "Bust mavjud kunlar", num: true, value: (r) => r.boost_days,
      heat: COLORS.heatPurple },
    { key: "stock_days", title: "Stokda mavjud kunlar", num: true, value: (r) => r.stock_days,
      tone: (r) => (periodDays == null ? undefined : stockDaysTone(r.stock_days)) },
    { key: "orders", title: "Buyurtmalar soni", num: true, value: (r) => r.orders },
    { key: "reviews", title: "Sharhlar", num: true, value: (r) => r.reviews },
    { key: "rating", title: "Reyting", num: true, value: (r) => r.rating, format: fmt.dec(1),
      tone: (r) => ratingTone(r.rating) },
    { key: "stock", title: "Qoldiq", num: true, value: (r) => r.stock },
    { key: "days_on_uzum", title: "Uzum'dagi kunlar", num: true, value: (r) => r.days_on_uzum },
  ];
}

export function skuColumns(
  { withSkuId = false, idFirst = false }: { withSkuId?: boolean; idFirst?: boolean } = {},
): Column<SkuRow>[] {
  return [
    // «SKU asosida» da hisobot jadvali SKU raqamidan boshlanadi;
    // «Sotuvchining SKUlari» da esa u o'rtada turadi (`withSkuId`).
    ...(idFirst ? [{ key: "sku", title: "sku", sortable: false, width: 74,
                     render: (r: SkuRow) => <span className={styles.muted}>{r.sku_id}</span> } as Column<SkuRow>] : []),
    { key: "image", title: "Uzum↗", sortable: false, width: 44, render: (r) => <Thumb id={r.product_id} src={r.image} /> },
    { key: "category", title: "Toifa 4", sortable: false, width: 80, render: (r) => r.category ?? "-" },
    {
      key: "shop", title: "Dokon", sortable: false, width: 70,
      render: (r) => r.shop_id ? <Link className={styles.link} href={`/market/shop?shop_id=${r.shop_id}`}>{r.shop}</Link>
        : r.shop,
    },
    {
      key: "title", title: "Kartochka↗", sortable: false, width: 140,
      render: (r) => <Link className={styles.link} href={`/market/card?id=${r.product_id}`}>{r.title}</Link>,
    },
    { key: "sku_title", title: "SKU", sortable: false, width: 90, render: (r) => r.sku_title ?? "" },
    { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, heat: COLORS.heatLight },
    ...(withSkuId ? [{ key: "sku_id", title: "sku", num: true, sortable: false,
                       value: (r: SkuRow) => r.sku_id } as Column<SkuRow>] : []),
    { key: "lost_revenue", title: "Yo'qotilgan tushum (soʻm)", num: true, value: (r) => r.lost_revenue,
      format: withSkuId ? fmt.compact0 : fmt.int, tone: (r) => lostTone(r.lost_revenue) },
    { key: "units", title: "Sotuv, donada", num: true, value: (r) => r.units },
    { key: "daily_units", title: "Kunlik sotuv (dona)", num: true, value: (r) => r.daily_units,
      format: withSkuId ? fmt.dec(2) : fmt.int },
    { key: "avg_price", title: "O'rtacha narx", num: true, value: (r) => r.avg_price,
      format: withSkuId ? fmt.dec(2) : fmt.int },
    { key: "fbs_days", title: "FBS dagi kunlar", num: true, value: (r) => r.fbs_days },
    { key: "stock_days", title: "Stokda mavjud kunlar", num: true, value: (r) => r.stock_days },
    { key: "turnover", title: "Oborot, kunlik", num: true, value: (r) => r.turnover, format: fmt.dec(2) },
    { key: "orders", title: "Buyurtmalar soni", num: true, value: (r) => r.orders },
    { key: "reviews", title: "Sharhlar", num: true, value: (r) => r.reviews },
    { key: "rating", title: "Reyting", num: true, value: (r) => r.rating, format: fmt.dec(1) },
    { key: "stock", title: "Qoldiq", num: true, value: (r) => r.stock, heat: COLORS.heatGreen },
  ];
}

export function periodDays(period: string): number | null {
  const match = /^d(\d+)$/.exec(period);
  if (match) return Number(match[1]);
  const month = /^m(\d{4})-(\d{2})$/.exec(period);
  if (month) return new Date(Number(month[1]), Number(month[2]), 0).getDate();
  return null;
}
