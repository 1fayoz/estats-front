"use client";

import * as React from "react";

import { ComboDaily, TwoLines } from "@/features/report/charts";
import { CategoryPathControl, useReportIndex } from "@/features/report/filters";
import {
  Card, DateRangeControl, Empty, FilterBar, ReportPage, dayLabel, styles, useLoad, useParams,
} from "@/features/report/ui";
import { report } from "@/lib/report";

/*
  «Dinamikasi» — barg turkumning tushumi vaqt bo'yicha.

  IKKI qator bor va ular bir-birini almashtirmaydi:

  · KUNLIK — o'z o'lchovimiz (va import qilingan tarix bo'lsa, o'sha).
    Sotuv ikki o'lchov ayirmasi bo'lgani uchun kun ham, undan oldingisi
    ham TO'LIQ o'lchangan bo'lishi shart — shuning uchun u qisqa
    boshlanadi va kun sayin uzayadi.

  · OYLIK — tashqi hisobotning oylik kesimlaridan, HAR turkum uchun
    bor. Ilgari sahifa faqat kunlik qatorni ko'rsatardi va toifa
    almashtirilgan zahoti «ma'lumot yo'q» chiqardi, holbuki oylik
    tarix bazada bor edi.

  Kunlik qator bo'sh bo'lsa oylik qator ASOSIY grafikka chiqadi va
  kunlik qator qachondan yig'ilayotgani AYTILADI — bo'sh ekran
  «ma'lumot yo'q» degan yolg'on taassurot qoldirmasin.
*/

const DEFAULT_PATH = "elektronika, smartfonlar va telefonlar, smartfonlar, smartfonlar android";

/* Oy nomlari QO'LDA — Chrome'da `Intl` ning "uz-UZ" ma'lumoti buzuq
   (xom ICU tokeni qaytaradi), bu loyihada allaqachon bir marta
   tuzatilgan sinf xato. */
const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function DynamicsPage() {
  const index = useReportIndex();
  const end = index?.as_of ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [params, setParams] = useParams({ path: DEFAULT_PATH, start: "", end: "" });
  /* Sana oynasi qo'lda tanlanmagan bo'lsa SO'RALMAYDI — backend shu
     turkumda bor eng erta kundan boshlab beradi (`first_day`). Ilgari
     front 360 kun qo'yardi va import qilingan tarix (2024-01-02 dan)
     bazada bor bo'lsa ham grafikka tushmasdi. */
  const { data, error } = useLoad(
    () => report.dynamics({ path: params.path, start: params.start || undefined, end: params.end || undefined }),
    [params.path, params.start, params.end],
  );
  const range = {
    start: params.start || data?.range?.start || shift(end, -360),
    end: params.end || data?.range?.end || end,
  };
  const series = data?.series ?? [];
  const label = (iso: string) => dayLabel(iso).replace(" y.", "");

  /* Oylik qatorni AYNAN kunlik grafik kutgan shaklga keltiramiz
     (`day` kaliti) — shunda ikkala holat bitta komponentdan chiziladi
     va grafiklar ikki nusxaga bo'linib ketmaydi. */
  const monthly = (data?.monthly ?? []).map((m) => ({
    ...m,
    day: m.month,
    median_price: m.avg_price,
  }));
  const monthName = (key: string) => {
    const [y, mm] = key.replace(/^m/, "").split("-");
    return `${MONTHS[Number(mm) - 1] ?? mm} ’${y.slice(2)}`;
  };

  return (
    <ReportPage>
      <FilterBar>
        <DateRangeControl start={range.start} end={range.end} style={{ width: 205 }}
                          onChange={(start, e) => setParams({ start, end: e })} />
        <CategoryPathControl value={params.path} onChange={(path) => setParams({ path: path ?? DEFAULT_PATH })}
                             style={{ flex: 1 }} />
      </FilterBar>
      {error ? <Card><Empty>{error}</Empty></Card> : null}

      {series.length ? (
        <Card>
          <div className={styles.note}>Kunlik</div>
          <ComboDaily data={series} bars="revenue" line="median_price" barName="Tushim (soʻm)"
                      lineName="O'rtacha narxlar (sotuvdagi kartochkalar narxining medianasi)" height={310}
                      dateLabel={label} />
          <TwoLines data={series} left="shops" right="cards" leftName="Do'konlar" rightName="Kartochkalar"
                    height={230} dateLabel={label} />
          <div className={styles.note}>
            Manba: {series.some((s) => s.source === "import") ? "import qilingan tarix" : ""}
            {series.some((s) => s.source === "import") && series.some((s) => s.source === "estats") ? " + " : ""}
            {series.some((s) => s.source === "estats") ? "o'z o'lchovimiz" : ""}
          </div>
        </Card>
      ) : null}

      {monthly.length ? (
        <Card>
          <div className={styles.note}>Oylik</div>
          <ComboDaily data={monthly} bars="revenue" line="median_price" barName="Tushim (soʻm)"
                      lineName="O'rtacha narx" height={310} dateLabel={monthName} />
          <TwoLines data={monthly} left="shops" right="cards" leftName="Do'konlar" rightName="Kartochkalar"
                    height={230} dateLabel={monthName} />
          <div className={styles.note}>
            Manba: tashqi hisobotning oylik kesimlari
            {data?.monthly?.length ? ` (${data.monthly[data.monthly.length - 1].as_of} holatiga)` : ""}
          </div>
        </Card>
      ) : null}

      {!series.length && !monthly.length && data ? (
        <Card>
          <Empty>
            {/* Ikki xil holat: tanlangan oraliqda ma'lumot yo'q (lekin boshqa kunlarda bor)
                va bu tovar turida UMUMAN ma'lumot yo'q — Uzum katalogida bor, lekin
                ichida tovar yo'q; tashqi hisobot ro'yxatida ham bunday tur yo'q
                (masalan «asalarichilik uchun, asalarichilik», 2026-09-26). */}
            {data.first_day
              ? `Tanlangan oraliqda ma'lumot yo'q — bu tovar turida ma'lumot ${label(data.first_day)} dan bor.`
              : "Bu tovar turida hozircha birorta ham tovar va sotuv yo'q — tashqi hisobotda ham ma'lumot yo'q. "
                + "Qo'shni tovar turini tanlang."}
          </Empty>
        </Card>
      ) : null}

      {!series.length && monthly.length ? (
        <div className={styles.note}>
          {data?.daily_from
            ? `Kunlik qator ${label(data.daily_from)} dan yig'ilyapti — sotuv ikki o'lchov ayirmasi bo'lgani `
              + "uchun kun ham, undan oldingisi ham to'liq o'lchangan bo'lishi shart."
            : "Kunlik qator hali yig'ilmagan — to'liq o'lchangan ketma-ket ikki kun kerak."}
        </div>
      ) : null}
    </ReportPage>
  );
}
