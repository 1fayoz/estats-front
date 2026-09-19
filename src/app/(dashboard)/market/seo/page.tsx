"use client";

import * as React from "react";
import Link from "next/link";

import {
  Card, Empty, InputControl, PeriodControl, ReportPage, Row, SourceNote, ZTable, fmt, styles, useLoad, useParams,
} from "@/features/report/ui";
import { CategoryPathControl } from "@/features/report/filters";
import { report, type KeywordRow } from "@/lib/report";

/*
  «Mahsulot kalitlari» — predmet bo'yicha qidiruv so'rovlari: davr
  qamrovi (ko'rsatishlar), kunlik qamrov, qidiruvdagi va reklamadagi
  SKU'lar, talab koeffitsiyenti. tashqi xizmatda sukut predmeti — «sumkalar».
*/

const LIMIT = 100;

const growthTone = (v: number | null) => (v == null ? undefined : v >= 0 ? { color: "#34a853" } : { color: "#ea4335" });

export default function KeywordsPage() {
  const [params, setParams] = useParams({
    period: "d30", subject: "sumkalar", category: "", keyword: "", sort: "coverage", dir: "desc", offset: "0",
  });
  const offset = Number(params.offset) || 0;
  // «Predmet» — tashqi xizmatda qidiruvli ro'yxat. Bizda erkin matn, lekin
  // yozilgani bo'yicha serverdan takliflar keladi (datalist).
  // «Tovar turini qidirish» — to'liq turkum yo'li tanlanadi; eksportda
  // faqat BARG nomi bor va u predmet bilan mos keladi
  // («aksessuarlar, …, sumkalar» → predmet «sumkalar»).
  const [subjectDraft, setSubjectDraft] = React.useState("");
  const [subjectQuery, setSubjectQuery] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setSubjectQuery(subjectDraft), 300);
    return () => clearTimeout(t);
  }, [subjectDraft]);
  const { data: subjects } = useLoad(
    () => report.keywordSubjects({ period: params.period, q: subjectQuery || undefined, limit: 50 }),
    [params.period, subjectQuery],
  );
  const { data, error } = useLoad(
    () => report.keywords({ period: params.period, subject: params.subject || undefined,
                            category: params.category || undefined,
                            keyword: params.keyword || undefined, sort: params.sort, dir: params.dir, offset,
                            limit: LIMIT }),
    [params.period, params.subject, params.category, params.keyword, params.sort, params.dir, offset],
  );
  const reset = { offset: null };

  return (
    <ReportPage>
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period, ...reset })} style={{ width: 195 }} />
        <InputControl label="Predmet:" value={params.subject}
                      onCommit={(subject) => setParams({ subject, ...reset })} style={{ width: 240 }}
                      options={(subjects?.items ?? []).map((s) => s.subject)}
                      onDraft={setSubjectDraft} />
        <InputControl label="SEO-kalit" value={params.keyword}
                      onCommit={(keyword) => setParams({ keyword, ...reset })} style={{ flex: 1 }} />
        <CategoryPathControl value={params.category || null} period={params.period}
                             onChange={(category) => setParams({ category, ...reset })} style={{ flex: 1 }} />
      </Row>
      <Card>
        {error ? <Empty>{error}</Empty> : null}
        <ZTable<KeywordRow>
          rows={data?.items ?? []}
          rowKey={(r) => `${r.keyword}|${r.subject}`}
          sort={params.sort}
          dir={params.dir as "asc" | "desc"}
          onSort={(sort, dir) => setParams({ sort, dir, ...reset })}
          offset={offset}
          total={data?.total}
          limit={LIMIT}
          onPage={(o) => setParams({ offset: String(o) })}
          height="calc(100vh - 250px)"
          columns={[
            { key: "keyword", title: "SEO-kalit ↗", sortable: false,
              render: (r) => (
                <Link className={styles.link} href={`/market/seo/keyword?keyword=${encodeURIComponent(r.keyword)}`}>
                  {r.keyword} ↗
                </Link>
              ) },
            { key: "subject", title: "subyekt", sortable: false, value: (r) => r.subject },
            { key: "competition", title: "Kalit so'z raqobati", center: true, sortable: false,
              render: (r) => (
                <Link className={styles.link}
                      href={`/market/seo/competitors?keyword=${encodeURIComponent(r.keyword)}`}>↗</Link>
              ) },
            { key: "uzum", title: "Uzum↗", center: true, sortable: false,
              render: (r) => (
                <a className={styles.link} target="_blank" rel="noreferrer"
                   href={`https://uzum.uz/uz/search?query=${encodeURIComponent(r.keyword)}`}>↗</a>
              ) },
            { key: "coverage", title: "Davr uchun qamrov", num: true, value: (r) => r.coverage, bar: "#1f3b73" },
            { key: "coverage_growth", title: "O'sish %", num: true, value: (r) => r.coverage_growth,
              format: fmt.pct(0), tone: (r) => growthTone(r.coverage_growth) },
            { key: "daily_coverage", title: "Kunlik qamrov", num: true, value: (r) => r.daily_coverage },
            { key: "search_skus", title: "Qidiruv SKU / kun", num: true, value: (r) => r.search_skus },
            { key: "search_skus_growth", title: "O'sish %", num: true, value: (r) => r.search_skus_growth,
              format: fmt.pct(0), tone: (r) => growthTone(r.search_skus_growth) },
            { key: "ads_skus", title: "Reklamadagi SKU / kun", num: true, value: (r) => r.ads_skus },
            { key: "ads_skus_growth", title: "O'sish %", num: true, value: (r) => r.ads_skus_growth,
              format: fmt.pct(0), tone: (r) => growthTone(r.ads_skus_growth) },
            { key: "demand", title: "Talab koeffitsiyenti", num: true, value: (r) => r.demand },
          ]}
          empty="Bu predmet va davr uchun kalit so'zlar hali yuklanmagan"
        />
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
