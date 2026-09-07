"use client";

import * as React from "react";
import { AlertTriangle, Check, ExternalLink, Info, X } from "lucide-react";

import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  AiCharacteristic,
  AiColors,
  AiCompetitor,
  AiCompliance,
  AiGeneratedImage,
  AiImagePlan,
  AiKeyword,
  AiMxik,
  AiPricing,
  AiSeoPlan,
  AiTexts,
  AiUnderstanding,
} from "@/lib/types";

/**
 * AI tadqiqoti natijasining bo'limlari.
 *
 * Butun panelning bitta boshqaruvchi g'oyasi bor:
 *
 *     **O'LCHANGAN narsa TAXMIN qilingandan ajratib ko'rsatiladi.**
 *
 * Model ishonch bilan noto'g'ri javob berishi mumkin, va bu javob
 * MXIK kodiga, soliq hujjatiga yoki xususiyatlarga o'tib ketadi.
 * Shuning uchun har bo'limda manba ko'rinadi: rang piksel bo'yicha
 * O'LCHANGANmi yoki model shunday ATAGANmi, fakt rasmda
 * KO'RINGANmi yoki TAXMIN qilinganmi, MXIK katalogda
 * TEKSHIRILGANmi yoki yo'q.
 */

// ── umumiy bo'laklar ─────────────────────────────────────────────

export function Section({
  title,
  hint,
  right,
  children,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[color:var(--air-line)] bg-[color:var(--air-card)] p-3">
      <header className="mb-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--air-head)]">
          {title}
        </h4>
        {hint && (
          <span className="text-[11px] text-[color:var(--air-label)]">{hint}</span>
        )}
        {right && <div className="ml-auto">{right}</div>}
      </header>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--air-line)] p-2">
      <div className="text-[10px] uppercase tracking-wide text-[color:var(--air-label)]">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          accent && "text-[color:var(--ok)]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Ishonch darajasi — RAQAM bilan, faqat rang bilan emas.
 *
 * "Yashil nuqta" o'zi hech nima demaydi: 0.71 ham, 0.99 ham
 * yashil bo'lib ko'rinardi, holbuki birinchisi qayta ko'rishni
 * talab qiladi.
 */
export function Confidence({ value }: { value: number }) {
  if (!value) return null;
  const pct = Math.round(value * 100);
  return (
    <span
      className="rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums"
      style={{
        color: pct >= 80 ? "var(--ok)" : pct >= 60 ? "var(--warn)" : "var(--bad)",
        background: `color-mix(in oklab, ${
          pct >= 80 ? "var(--ok)" : pct >= 60 ? "var(--warn)" : "var(--bad)"
        } 14%, transparent)`,
      }}
    >
      {pct}%
    </span>
  );
}

function Note({ tone, children }: { tone: "bad" | "warn" | "ok" | "info"; children: React.ReactNode }) {
  const Icon = tone === "ok" ? Check : tone === "info" ? Info : AlertTriangle;
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border p-2 text-xs",
        tone === "bad" && "border-destructive/30 bg-destructive/5 text-destructive",
        tone === "warn" && "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-500",
        tone === "ok" && "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-500",
        tone === "info" && "border-[color:var(--air-line)] text-[color:var(--air-label)]",
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export { Note };

// ── 1. Mahsulotni tushunish ──────────────────────────────────────

const FACT_LABEL: Record<string, string> = {
  product_type: "Tovar turi",
  category: "Turkum",
  subcategory: "Ichki turkum",
  brand: "Brend",
  material: "Material",
  colors: "Rang",
};

function factList(facts: Record<string, string | string[]>) {
  return Object.entries(facts).map(([key, value]) => ({
    label: FACT_LABEL[key] ?? key,
    text: Array.isArray(value) ? value.join(", ") : value,
  }));
}

export function UnderstandingSection({ data }: { data: AiUnderstanding }) {
  const certain = factList(data.certain_facts ?? {});
  const assumed = factList(data.assumptions ?? {});

  return (
    <Section
      title="Mahsulot tahlili"
      hint={data.model || undefined}
      right={<Confidence value={data.confidence} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {/*
          Ko'rilgan va taxmin qilingan ikki ALOHIDA ustunda.
          Bir ro'yxatda kichik belgi bilan ajratilsa, sotuvchi
          taxminni fakt deb o'qib ketardi — aynan shu xato MXIK
          kodiga va soliq hujjatiga o'tadi.
        */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-500">
            <Check className="h-3.5 w-3.5" />
            Aniqlangan
          </div>
          {certain.length ? (
            <dl className="space-y-1 text-xs">
              {certain.map((f) => (
                <div key={f.label} className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[color:var(--air-label)]">{f.label}</dt>
                  <dd className="font-medium">{f.text}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-[color:var(--air-label)]">Rasmdan aniq fakt olinmadi.</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Taxmin — tekshiring
          </div>
          {assumed.length ? (
            <dl className="space-y-1 text-xs">
              {assumed.map((f) => (
                <div key={f.label} className="flex gap-2">
                  <dt className="w-24 shrink-0 text-[color:var(--air-label)]">{f.label}</dt>
                  <dd className="font-medium">{f.text}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-[color:var(--air-label)]">Taxmin yo&apos;q.</p>
          )}
        </div>
      </div>

      {data.main_features?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.main_features.map((f) => (
            <span
              key={f}
              className="rounded-md bg-black/[.04] px-2 py-0.5 text-[11px] text-[color:var(--air-head)]"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {data.unclear?.length > 0 && (
        <div className="mt-3">
          <Note tone="info">
            Aniqlab bo&apos;lmadi: {data.unclear.join(" · ")}
          </Note>
        </div>
      )}
    </Section>
  );
}

// ── 2. Raqobatchilar ─────────────────────────────────────────────

export function CompetitorsSection({ items }: { items: AiCompetitor[] }) {
  const [all, setAll] = React.useState(false);
  const shown = all ? items : items.slice(0, 12);

  return (
    <Section
      title="O'xshash raqobatchilar"
      hint={`${items.length} ta — o'xshashlik bo'yicha saralangan`}
      right={
        items.length > 12 ? (
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            className="text-[11px] text-[color:var(--air-head)] underline-offset-2 hover:underline"
          >
            {all ? "Kamroq" : `Hammasi (${items.length})`}
          </button>
        ) : null
      }
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((c) => (
          <a
            key={c.competitor_id}
            href={c.url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-lg border border-[color:var(--air-line)] transition-colors hover:bg-black/[.03]"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-black/[.04]">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : null}
              {/*
                O'xshashlik balli rasmning USTIDA: bu ro'yxatning
                asosiy saralash mezoni va rasmdan ajralib turishi
                kerak — "shu tovarga qanchalik o'xshash" degan
                savolga javob shu raqam.
              */}
              <span
                className="absolute left-1 top-1 rounded-md px-1.5 py-px text-[10px] font-semibold tabular-nums text-white"
                style={{
                  background:
                    c.similarity_score >= 0.6
                      ? "color-mix(in oklab, var(--ok) 80%, black)"
                      : c.similarity_score >= 0.35
                        ? "color-mix(in oklab, var(--warn) 80%, black)"
                        : "rgba(0,0,0,.55)",
                }}
              >
                {Math.round(c.similarity_score * 100)}%
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-2">
              <span className="text-sm font-semibold tabular-nums">
                {c.price ? formatSum(c.price) : "—"}
              </span>
              <span className="line-clamp-2 text-[11px] text-[color:var(--air-label)]">
                {c.title}
              </span>
              {c.why?.length > 0 && (
                <span className="line-clamp-1 text-[10px] text-[color:var(--air-label)]">
                  {c.why.join(" · ")}
                </span>
              )}
              <div className="mt-auto flex items-center gap-2 pt-1 text-[10px] text-[color:var(--air-label)] tabular-nums">
                {c.orders > 0 && <span>{formatNumber(c.orders)} buyurtma</span>}
                {c.rating ? <span>⭐ {c.rating.toFixed(1)}</span> : null}
                <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}

// ── 3. Ranglar ───────────────────────────────────────────────────

export function ColorsSection({ data }: { data: AiColors }) {
  return (
    <Section
      title="Rang"
      hint="fon emas, tovarning O'Z rangi"
      right={<Confidence value={data.confidence} />}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{data.primary || "—"}</span>
        {data.secondary && (
          <span className="text-xs text-[color:var(--air-label)]">
            + {data.secondary}
          </span>
        )}
        {data.multicolor && (
          <span className="rounded-full bg-black/[.05] px-2 py-px text-[10px]">
            ko&apos;p rangli
          </span>
        )}
      </div>

      {/*
        O'LCHANGAN ranglar — haqiqiy piksel namunasi bilan.
        Model nomlagani bilan yonma-yon turadi, chunki ular MOS
        KELMASLIGI mumkin: oq fondagi qora tovarni model "oq" deb
        atashi aynan shu yerda ko'rinadi.
      */}
      {data.measured?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {data.measured.map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              className="flex items-center gap-1.5 rounded-md border border-[color:var(--air-line)] py-1 pl-1 pr-2"
            >
              <span
                className="h-5 w-5 rounded border border-black/10"
                style={{ background: `rgb(${m.rgb.join(",")})` }}
              />
              <span className="text-[11px]">{m.name}</span>
              <span className="text-[10px] tabular-nums text-[color:var(--air-label)]">
                {Math.round(m.share * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2.5">
        {data.agreed ? (
          <Note tone="ok">O&apos;lchov va model bir xil rangni ko&apos;rsatdi.</Note>
        ) : (
          <Note tone="warn">
            O&apos;lchov va model KELISHMADI
            {data.model_named?.length > 0 && <> — model: {data.model_named.join(", ")}</>}.
            Rangni o&apos;zingiz tasdiqlang.
          </Note>
        )}
      </div>
    </Section>
  );
}

// ── 4. SEO ───────────────────────────────────────────────────────

const GROUP_LABEL: Record<string, string> = {
  primary: "Asosiy",
  secondary: "Ikkinchi darajali",
  long_tail: "Uzun dumli",
  attribute: "Xususiyat",
  use_case: "Ishlatilishi",
  audience: "Auditoriya",
};

function KeywordChip({ k }: { k: AiKeyword }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px]",
        k.covered
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-500"
          : "bg-black/[.05] text-[color:var(--air-head)]",
      )}
      title={
        `og'irlik ${k.weight.toFixed(2)}` +
        (k.demand ? ` · talab ${formatNumber(k.demand)}` : "") +
        (k.suggest_rank !== null ? ` · avtotaklif #${k.suggest_rank + 1}` : "")
      }
    >
      {k.covered && <Check className="h-3 w-3" />}
      {k.phrase}
    </span>
  );
}

export function SeoSection({ data }: { data: AiSeoPlan }) {
  const coverage = Math.round(data.coverage * 100);
  const missed = Math.round(data.missed_coverage * 100);

  return (
    <Section title="Kalit so'zlar va qamrov" hint={`${data.keywords.length} ta so'z`}>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Qamrab olindi" value={`${coverage}%`} accent={coverage >= 60} />
        {/*
          "Qo'ldan ketayotgan qamrov" — ZoomSelling auditining
          asosiy ko'rsatkichi: matnda YO'Q, lekin talabi BOR
          so'zlarning og'irligi. Oddiy "qamrov" foizidan foydaliroq,
          chunki u nima YUTQAZILAYOTGANINI aytadi.
        */}
        <Stat label="Qo'ldan ketyapti" value={`${missed}%`} />
      </div>

      {data.missing_top?.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] font-semibold text-[color:var(--air-head)]">
            Eng foydali, lekin matnda YO&apos;Q
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.missing_top.map((k) => (
              <KeywordChip key={k.phrase} k={k} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {Object.entries(data.grouped ?? {})
          .filter(([, list]) => list.length > 0)
          .map(([group, list]) => (
            <div key={group}>
              <div className="mb-1 text-[11px] text-[color:var(--air-label)]">
                {GROUP_LABEL[group] ?? group}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {list.map((k) => (
                  <KeywordChip key={k.phrase} k={k} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </Section>
  );
}

// ── 5. Matnlar ───────────────────────────────────────────────────

export function TextsSection({ data }: { data: AiTexts }) {
  return (
    <Section title="Nom va tavsif" hint={data.model || undefined}>
      {/*
        `ok=false` — matn draftga YOZILMAGAN. Buni aytmaslik eng
        chalkash holat bo'lardi: sotuvchi bu yerda yaxshi matnni
        ko'rib, «Umumiy» tabda eskisini topardi va sababini
        bilmasdi.
      */}
      {!data.ok && (
        <div className="mb-2.5">
          <Note tone="warn">
            Matn tekshiruvdan o&apos;tmadi va kartochkaga YOZILMADI
            {data.issues?.length > 0 && (
              <> — {data.issues.map((i) => i.message).join("; ")}</>
            )}
            .
          </Note>
        </div>
      )}

      <div className="space-y-2.5">
        {([
          ["O'zbekcha nom", data.title_uz],
          ["Ruscha nom", data.title_ru],
          ["O'zbekcha tavsif", data.description_uz],
          ["Ruscha tavsif", data.description_ru],
          ["Ishlatish yo'riqnomasi", data.usage_uz],
          ["Parvarish", data.care_uz],
        ] as const)
          .filter(([, value]) => Boolean(value))
          .map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] uppercase tracking-wide text-[color:var(--air-label)]">
                {label}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-xs">{value}</p>
            </div>
          ))}
      </div>

      {data.bullets_uz?.length > 0 && (
        <ul className="mt-2.5 space-y-1">
          {data.bullets_uz.map((b, i) => (
            <li key={i} className="flex gap-1.5 text-xs">
              <span className="text-[color:var(--air-label)]">•</span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// ── 6. Narx ──────────────────────────────────────────────────────

export function PricingSection({ data }: { data: AiPricing }) {
  return (
    <Section
      title="Narx tahlili"
      hint={
        data.sample
          ? `${data.sample} ta o'xshash tovar` +
            (data.dropped ? ` · ${data.dropped} tasi chetlatildi` : "")
          : undefined
      }
      right={<Confidence value={data.confidence} />}
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Eng arzon" value={data.market_min ? formatSum(data.market_min) : "—"} />
        <Stat
          label="O'rtacha"
          value={data.market_median ? formatSum(data.market_median) : "—"}
        />
        <Stat label="Eng qimmat" value={data.market_max ? formatSum(data.market_max) : "—"} />
      </div>

      {data.recommended_price > 0 && (
        <div className="mt-2.5 rounded-lg border border-[color:var(--ok)]/30 bg-[color:var(--ok)]/5 p-2.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-[color:var(--air-label)]">
              Tavsiya
            </span>
            <span className="text-base font-semibold tabular-nums text-[color:var(--ok)]">
              {formatSum(data.recommended_price)}
            </span>
            {/*
              Chegirma juftligi REAL: to'liq narx bozor shiftidan
              oshmaydi. "500 ming → 100 ming" ko'rinishidagi soxta
              chegirma Uzum moderatsiyasida ham, xaridorda ham
              ishonchni yo'qotadi.
            */}
            {data.recommended_full_price > data.recommended_price && (
              <>
                <span className="text-xs text-[color:var(--air-label)] line-through tabular-nums">
                  {formatSum(data.recommended_full_price)}
                </span>
                <span className="rounded-full bg-[color:var(--bad)]/10 px-1.5 py-px text-[10px] font-semibold text-[color:var(--bad)]">
                  −{data.discount_percent}%
                </span>
              </>
            )}
          </div>
          {data.reasoning_summary && (
            <p className="mt-1 text-[11px] text-[color:var(--air-label)]">
              {data.reasoning_summary}
            </p>
          )}
        </div>
      )}

      {(data.competitive_price > 0 || data.premium_price > 0) && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Stat
            label="Raqobatga kirish"
            value={data.competitive_price ? formatSum(data.competitive_price) : "—"}
          />
          <Stat
            label="Premium"
            value={data.premium_price ? formatSum(data.premium_price) : "—"}
          />
        </div>
      )}

      {data.notes?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {data.notes.map((n, i) => (
            <li key={i} className="text-[11px] text-[color:var(--air-label)]">
              • {n}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// ── 7. MXIK ──────────────────────────────────────────────────────

export function MxikSection({ data }: { data: AiMxik }) {
  const verified = data.status === "verified";
  const notFound = data.status === "not_found";

  return (
    <Section
      title="MXIK kodi"
      hint="soliq hujjatiga tushadi"
      right={<Confidence value={data.confidence} />}
    >
      {/*
        Topilmagani AYBLANMAYDI va yashirilmaydi. Loyihaning
        qat'iy qoidasi: ishonch bilan aytilgan NOTO'G'RI koddan
        ko'ra «aniqlab bo'lmadi» afzal — noto'g'ri MXIK soliq
        muammosi, bo'sh MXIK esa bir daqiqalik qo'l mehnati.
      */}
      {notFound || !data.code ? (
        <Note tone="warn">
          Kod aniqlanmadi. Rasmiy katalogdan o&apos;zingiz tanlang —
          taxminiy kod yozilmadi.
        </Note>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-black/[.05] px-2 py-1 text-sm font-semibold tabular-nums">
              {data.code}
            </code>
            {verified ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-500">
                <Check className="h-3.5 w-3.5" />
                katalogda tekshirildi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                tasdiqlang
              </span>
            )}
            {data.agreed === true && (
              <span className="text-[11px] text-[color:var(--air-label)]">
                ikki model rozi
              </span>
            )}
          </div>
          {data.name && <p className="mt-1 text-xs">{data.name}</p>}
          {data.path && (
            <p className="mt-0.5 text-[11px] text-[color:var(--air-label)]">{data.path}</p>
          )}
          {!data.auto_acceptable && (
            <div className="mt-2">
              <Note tone="info">
                Ishonch yetarli emas — kod kartochkaga avtomatik yozilmadi.
              </Note>
            </div>
          )}
        </>
      )}

      <a
        href={`https://tasnif.soliq.uz/?search=${encodeURIComponent(data.name || data.code || "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-[color:var(--air-head)] underline-offset-2 hover:underline"
      >
        Rasmiy katalogda tekshirish
        <ExternalLink className="h-3 w-3" />
      </a>

      {data.evidence?.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-[color:var(--air-label)]">
            Qanday qidirildi ({data.evidence.length})
          </summary>
          <ul className="mt-1 space-y-0.5">
            {data.evidence.map((e, i) => (
              <li key={i} className="text-[11px] text-[color:var(--air-label)]">
                • {e}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Section>
  );
}

// ── 8. Uzum xususiyatlari ────────────────────────────────────────

export function CharacteristicsSection({ items }: { items: AiCharacteristic[] }) {
  return (
    <Section
      title="Uzum xususiyatlari"
      hint={`${items.filter((i) => i.accepted).length}/${items.length} to'ldirildi`}
    >
      <dl className="divide-y divide-[color:var(--air-line)] text-xs">
        {items.map((c) => (
          <div key={c.characteristic_id} className="flex items-start gap-2 py-1.5">
            <dt className="flex-1 text-[color:var(--air-label)]">
              {c.characteristic_name}
              {c.required && <span className="ml-0.5 text-[color:var(--bad)]">*</span>}
            </dt>
            <dd className="flex items-center gap-1.5 text-right">
              {c.value ? (
                <>
                  <span className="font-medium">{c.value}</span>
                  {/*
                    Manba muhim: "deterministic" — Uzum ro'yxatidagi
                    qiymat bilan ANIQ moslik, ya'ni tekshirish shart
                    emas; "model" — AI tanlagan, ko'z yugurtirilsin.
                  */}
                  <span className="text-[10px] text-[color:var(--air-label)]">
                    {c.source === "deterministic" ? "aniq" : "AI"}
                  </span>
                </>
              ) : (
                <span className="text-[color:var(--air-label)]">—</span>
              )}
              {c.value && !c.accepted && (
                <X className="h-3 w-3 text-[color:var(--bad)]" />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

// ── 9. Rasm strategiyasi va yasalgan kadrlar ─────────────────────

export function ImagesSection({
  plan,
  generated,
}: {
  plan?: AiImagePlan;
  generated?: AiGeneratedImage[];
}) {
  return (
    <Section
      title="Rasm strategiyasi"
      hint={plan?.tone || undefined}
      right={
        generated?.length ? (
          <span className="text-[11px] text-[color:var(--air-label)] tabular-nums">
            {generated.filter((g) => g.accepted).length}/{generated.length} qabul qilindi
          </span>
        ) : null
      }
    >
      {/*
        Ijodiy yo'nalish HAR TOVARGA XOS — umumiy shablon EMAS.
        Shuning uchun u panelda ko'rinadi: sotuvchi kadrlar nega
        aynan shunday yasalganini bilishi kerak.
      */}
      {plan?.creative_direction && (
        <p className="rounded-lg bg-black/[.03] p-2 text-xs">{plan.creative_direction}</p>
      )}

      {plan?.palette && plan.palette.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[color:var(--air-label)]">Palitra:</span>
          {plan.palette.map((c) => (
            <span
              key={c}
              className="h-4 w-4 rounded border border-black/10"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      )}

      {plan?.images && plan.images.length > 0 && (
        <ol className="mt-2.5 space-y-1.5">
          {plan.images.map((img) => {
            const made = generated?.find((g) => g.position === img.position);
            return (
              <li
                key={img.position}
                className="flex items-start gap-2 rounded-lg border border-[color:var(--air-line)] p-2 text-xs"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/[.05] text-[10px] font-semibold tabular-nums">
                  {img.position}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">{img.type}</span>
                    <span className="text-[11px] text-[color:var(--air-label)]">
                      {img.purpose}
                    </span>
                  </div>
                  {img.composition && (
                    <p className="mt-0.5 text-[11px] text-[color:var(--air-label)]">
                      {img.composition}
                    </p>
                  )}
                  {/*
                    Tekshiruv natijasi kadr YONIDA: "asl tovarga
                    o'xshashlik" — bu quvurdagi eng muhim
                    qo'riqchi (tugma soni, halqa soni, rang
                    o'zgarib ketmasin).
                  */}
                  {made && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                      {made.accepted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-500">
                          <Check className="h-3 w-3" />
                          asl tovarga mos {Math.round(made.visual_similarity * 100)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[color:var(--bad)]">
                          <X className="h-3 w-3" />
                          rad etildi {Math.round(made.visual_similarity * 100)}%
                        </span>
                      )}
                      {made.attempts > 1 && (
                        <span className="text-[color:var(--air-label)]">
                          {made.attempts} urinish
                        </span>
                      )}
                      {made.differences?.length > 0 && (
                        <span className="text-[color:var(--air-label)]">
                          {made.differences.join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {plan?.avoid && plan.avoid.length > 0 && (
        <div className="mt-2">
          <Note tone="info">Qochilsin: {plan.avoid.join(" · ")}</Note>
        </div>
      )}
    </Section>
  );
}

// ── 10. Uzum tekshiruvi ──────────────────────────────────────────

export function ComplianceSection({ data }: { data: AiCompliance }) {
  return (
    <Section
      title="Uzum tekshiruvi"
      right={
        data.ready ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-500">
            <Check className="h-3.5 w-3.5" />
            tayyor
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--bad)]">
            <AlertTriangle className="h-3.5 w-3.5" />
            {data.blocking.length} to&apos;siq
          </span>
        )
      }
    >
      {data.summary && <p className="mb-2 text-xs">{data.summary}</p>}
      <div className="space-y-1.5">
        {data.blocking.map((i) => (
          <Note key={i.code} tone="bad">
            {i.message}
            {i.action && (
              <span className="block text-[11px] opacity-80">→ {i.action}</span>
            )}
          </Note>
        ))}
        {data.warnings.map((i) => (
          <Note key={i.code} tone="warn">
            {i.message}
            {i.action && (
              <span className="block text-[11px] opacity-80">→ {i.action}</span>
            )}
          </Note>
        ))}
        {!data.blocking.length && !data.warnings.length && (
          <Note tone="ok">Kamchilik topilmadi.</Note>
        )}
      </div>
    </Section>
  );
}
