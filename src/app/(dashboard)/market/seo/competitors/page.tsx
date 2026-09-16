"use client";

import * as React from "react";
import Link from "next/link";

import {
  Card, Empty, InputControl, ReportPage, Row, fmt, styles, useLoad, useParams,
} from "@/features/report/ui";
import { formatNumber } from "@/lib/format";
import { report } from "@/lib/report";

/*
  «Raqobatchilar va pozitsiyalar» — so'rov bo'yicha oxirgi 7 kun:
  qaysi kartochka qidiruvda nechanchi o'rinda, TOPda boost (reklama)
  bilanmi. Reklama va organik chiqish alohida qator (ZoomSelling'dagi kabi).
*/

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];

export default function CompetitorsPage() {
  const [params, setParams] = useParams({ keyword: "xiaomi", shop: "" });
  const { data, error } = useLoad(() => report.competitors({ keyword: params.keyword }), [params.keyword]);
  const items = (data?.items ?? []).filter(
    (i) => !params.shop || (i.shop ?? "").toLowerCase().includes(params.shop.toLowerCase()),
  );
  const latest = data?.latest;

  return (
    <ReportPage>
      <Row>
        <InputControl label="SEO-kalit:" value={params.keyword}
                      onCommit={(keyword) => setParams({ keyword: keyword || "xiaomi" })} style={{ flex: 1 }} />
        <InputControl label="Do'konlar soni" value={params.shop} placeholder="do'kon nomi"
                      onCommit={(shop) => setParams({ shop })} style={{ flex: 1 }} />
      </Row>
      <div style={{ fontSize: 12, padding: "6px 2px 0" }}>Tanlangan kalit so&apos;z bo&apos;yicha o&apos;tgan kunning ma&apos;lumotlari</div>
      <Card>
        <table className={styles.ztable}>
          <thead>
            <tr>
              <th>Uzum↗</th>
              <th>Kunlik qamrov (koʻrsatishlar soni)</th>
              <th>Qidiruv natijalaridagi kartochkalar</th>
              <th>Reklamadagi SKU</th>
              <th>Talab koeffitsiyenti</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <a className={styles.link} target="_blank" rel="noreferrer"
                   href={`https://uzum.uz/uz/search?query=${encodeURIComponent(params.keyword)}`}>&gt;&gt;</a>
              </td>
              <td>{fmt.int(latest?.coverage)}</td>
              <td>{fmt.int(latest?.cards)}</td>
              <td>{fmt.int(latest?.cards_in_ads)}</td>
              <td>{fmt.dec(2)(latest?.demand_ratio)}</td>
            </tr>
          </tbody>
        </table>
      </Card>
      <div style={{ textAlign: "center", fontSize: 15, padding: "10px 0 2px" }}>
        So‘nggi 7 kun ichida kalit so‘z bo‘yicha SKU pozitsiyalari || Kunlar bo‘yicha TOPdagi boost — ha/yo‘q ||
        1–10-o‘rinlardagi pozitsiyalar savdolarning 80% ini beradi
      </div>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Card>
        <div className={styles.tableWrap} style={{ maxHeight: "calc(100vh - 330px)" }}>
          <table className={styles.ztable}>
            <thead>
              <tr>
                <th colSpan={4} />
                <th colSpan={data?.days.length ?? 7} style={{ textAlign: "right" }}>
                  Sana / Kalit so‘z bo‘yicha qidiruvda kartochka pozitsiyasi
                </th>
              </tr>
              <tr>
                <th style={{ background: "#fff", color: "#000" }}>SKU</th>
                <th style={{ background: "#fff", color: "#000" }}>Kategoriya 3</th>
                <th style={{ background: "#fff", color: "#000" }}>Do&apos;konlar</th>
                <th style={{ background: "#fff", color: "#000" }}>Bust</th>
                {(data?.days ?? []).map((d) => {
                  const [, m, day] = d.split("-");
                  return (
                    <th key={d} style={{ background: "#fff", color: "#000", textAlign: "center" }}>
                      {MONTHS[Number(m) - 1]}. {Number(day)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.product_id}|${item.boost}`}>
                  <td style={{ maxWidth: 360, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    <Link className={styles.link} href={`/market/card?id=${item.product_id}`}>{item.title}</Link>
                  </td>
                  <td>{item.category ?? "-"}</td>
                  <td>
                    {item.shop_id ? (
                      <Link className={styles.link} href={`/market/shop?shop_id=${item.shop_id}`}>{item.shop}</Link>
                    ) : item.shop}
                  </td>
                  <td style={{ color: item.boost ? "#ea4335" : "#000" }}>{item.boost ? "ha" : "yo'q"}</td>
                  {(data?.days ?? []).map((d) => {
                    const v = item.positions[d];
                    const top = v != null && v <= 10;
                    return (
                      <td key={d} style={{ textAlign: "center", background: v != null ? "rgba(100,181,246,0.35)" : undefined,
                                           color: item.boost && v != null ? "#ea4335" : undefined,
                                           fontWeight: top ? 700 : 400 }}>
                        {v == null ? "-" : formatNumber(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!items.length ? (
                <tr><td colSpan={4 + (data?.days.length ?? 7)}><Empty>Bu so&apos;rov bo&apos;yicha o&apos;rinlar hali o&apos;lchanmagan</Empty></td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </ReportPage>
  );
}
