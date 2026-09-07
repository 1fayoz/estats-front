"use client";

import * as React from "react";
import { AlertTriangle, Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  ApiError,
  fetchAiIntelligence,
  startAiIntelligence,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft, AiIntelligence } from "@/lib/types";
import {
  CharacteristicsSection,
  ColorsSection,
  CompetitorsSection,
  ComplianceSection,
  ImagesSection,
  MxikSection,
  Note,
  PricingSection,
  SeoSection,
  TextsSection,
  UnderstandingSection,
} from "@/features/products-ai/components/intelligence-sections";

/** Quvur ishlayotganda holat shuncha vaqtda bir so'raladi. */
const POLL_MS = 3000;

/**
 * AI tadqiqot ish maydoni (§18).
 *
 * Bu «Bozor» yoki «Rasmlar» tabining kengaytmasi EMAS, alohida
 * bo'lim: bu yerda kartochkaning HAR bir qismi qanday va NIMAGA
 * tayanib qurilgani ko'rinadi — tovar tahlili, raqobatchilar,
 * rang, SEO, matn, narx, MXIK, xususiyatlar, rasm strategiyasi va
 * Uzum tekshiruvi.
 *
 * Ikki narsa ataylab shunday qilingan:
 *
 * 1. **Quvur FONDA ketadi.** 80 raqobatchi rasmini tahlil qilish
 *    va kadr yasash bir necha daqiqa — sotuvchi oynani yopib
 *    ketsa ham ish davom etadi, natija qoralamada saqlanadi.
 *
 * 2. **Faqat YIQILGAN qadam qayta uriladi.** Har qadam pul turadi;
 *    "SEO yiqilgani uchun" butun tadqiqotni qaytadan yuritish
 *    xarajatni ikki barobar qilardi.
 */
export function IntelligencePanel({
  draft,
  locked,
}: {
  draft: AiDraft;
  locked: boolean;
}) {
  const [state, setState] = React.useState<AiIntelligence | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const draftId = draft.id;

  // Birinchi yuklash.
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchAiIntelligence(draftId)
      .then((data) => alive && setState(data))
      .catch(() => {
        /* Ruxsat yo'q yoki hali boshlanmagan — panel bo'sh holatda qoladi. */
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [draftId]);

  // Ishlayotgan quvurni so'rab turish. Bog'liqlik PRIMITIV
  // (`running`) — obyekt qo'yilsa har javob effektni qaytadan
  // ishga tushirib, cheksiz halqa bo'lardi (§10 dagi tuzoq).
  const running = state?.running ?? false;
  React.useEffect(() => {
    if (!running) return;
    let alive = true;
    const timer = setInterval(() => {
      fetchAiIntelligence(draftId)
        .then((data) => alive && setState(data))
        .catch(() => {
          /* Bitta yiqilgan so'rov so'rab turishni to'xtatmaydi. */
        });
    }, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [running, draftId]);

  const start = async (only: string[] = []) => {
    setBusy(true);
    try {
      setState(await startAiIntelligence(draftId, only));
      toast.success(
        only.length ? "Yiqilgan qadamlar qayta urinilmoqda." : "Tadqiqot boshlandi.",
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Boshlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-[color:var(--air-label)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Yuklanmoqda…
      </p>
    );
  }

  const result = state?.result ?? {};
  const hasResult = Object.keys(result).some((k) => k !== "updated_at");
  const failed = state?.failedSteps ?? [];

  return (
    <div className="space-y-3">
      <Header
        state={state}
        busy={busy}
        locked={locked}
        hasResult={hasResult}
        onStart={() => void start()}
        onRetry={() => void start(failed)}
      />

      {state && (state.running || Object.keys(state.steps).length > 0) && (
        <StepList state={state} busy={busy} locked={locked} onRetry={(key) => void start([key])} />
      )}

      {/*
        Natija bo'limlari quvur tugashini KUTMAYDI: har qadam
        tugagach o'z bo'limi paydo bo'ladi. Sotuvchi raqobatchilarni
        rasm yasalayotgan paytda ham ko'rib turadi.
      */}
      {result.understanding && <UnderstandingSection data={result.understanding} />}
      {result.colors && <ColorsSection data={result.colors} />}
      {result.competitors && result.competitors.length > 0 && (
        <CompetitorsSection items={result.competitors} />
      )}
      {result.seo && <SeoSection data={result.seo} />}
      {result.texts && <TextsSection data={result.texts} />}
      {result.pricing && <PricingSection data={result.pricing} />}
      {result.mxik && <MxikSection data={result.mxik} />}
      {result.characteristics && result.characteristics.length > 0 && (
        <CharacteristicsSection items={result.characteristics} />
      )}
      {(result.image_plan || result.generated_images) && (
        <ImagesSection plan={result.image_plan} generated={result.generated_images} />
      )}
      {result.compliance && <ComplianceSection data={result.compliance} />}

      {!hasResult && !state?.running && (
        <p className="rounded-lg border border-dashed border-[color:var(--air-ctl-line)] p-6 text-center text-sm text-[color:var(--air-label)]">
          Tadqiqot hali o&apos;tkazilmagan. «Tadqiqotni boshlash» bosing —
          tovar tahlil qilinadi, raqobatchilar topiladi, matn, narx va
          rasm strategiyasi tayyorlanadi.
        </p>
      )}
    </div>
  );
}

// ── boshqaruv qatori ─────────────────────────────────────────────

function Header({
  state,
  busy,
  locked,
  hasResult,
  onStart,
  onRetry,
}: {
  state: AiIntelligence | null;
  busy: boolean;
  locked: boolean;
  hasResult: boolean;
  onStart: () => void;
  onRetry: () => void;
}) {
  const running = state?.running ?? false;
  const failed = state?.failedSteps ?? [];
  const progress = state?.progress ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-[color:var(--air-label)]">
          {running ? (
            <>
              {state?.labels?.[state.current] ?? "Bajarilmoqda"}
              {state?.detail && <> — {state.detail}</>}
            </>
          ) : hasResult ? (
            "Tadqiqot natijasi"
          ) : (
            "To'liq AI tadqiqoti"
          )}
        </p>

        {!locked && (
          <div className="ml-auto flex items-center gap-2">
            {failed.length > 0 && !running && (
              <button
                type="button"
                onClick={onRetry}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--bad)]/40 px-2.5 py-1 text-xs text-[color:var(--bad)] transition hover:bg-[color:var(--bad)]/5 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {failed.length} yiqilganini qayta urinish
              </button>
            )}
            <button
              type="button"
              onClick={onStart}
              disabled={busy || running}
              className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--air-ctl-line)] px-2.5 py-1 text-xs text-[color:var(--air-head)] transition hover:bg-black/[.04] disabled:opacity-50"
            >
              {busy || running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {hasResult ? "Qaytadan" : "Tadqiqotni boshlash"}
            </button>
          </div>
        )}
      </div>

      {(running || (progress > 0 && progress < 100)) && (
        <div className="h-1.5 overflow-hidden rounded-full bg-black/[.06]">
          <div
            className="h-full rounded-full bg-[color:var(--ok)] transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/*
        Umumiy xato (`_`) — quvurning O'ZI yiqilgan holati, alohida
        qadamniki emas. Uni qadam ro'yxatida ko'rsatib bo'lmaydi.
      */}
      {state?.errors?._ && <Note tone="bad">{state.errors._}</Note>}
    </div>
  );
}

// ── qadamlar ro'yxati ────────────────────────────────────────────

const STEP_TONE: Record<string, string> = {
  done: "text-emerald-700 dark:text-emerald-500",
  running: "text-[color:var(--air-head)]",
  failed: "text-[color:var(--bad)]",
  skipped: "text-[color:var(--air-label)]",
  pending: "text-[color:var(--air-label)]",
};

function StepList({
  state,
  busy,
  locked,
  onRetry,
}: {
  state: AiIntelligence;
  busy: boolean;
  locked: boolean;
  onRetry: (key: string) => void;
}) {
  // Tartib `labels` dan olinadi — u backenddagi `STEPS` ning
  // O'Z tartibida keladi, ya'ni bog'liqlik tartibida. Frontendda
  // qayta yozilsa ikkalasi vaqt bilan bir-biridan uzoqlashardi.
  const keys = Object.keys(state.labels ?? {});
  if (!keys.length) return null;

  return (
    <div className="rounded-xl border border-[color:var(--air-line)] bg-[color:var(--air-card)] p-2">
      <ul className="space-y-0.5">
        {keys.map((key) => {
          const status = state.steps?.[key] ?? "pending";
          const error = state.errors?.[key];
          return (
            <li key={key} className="flex items-start gap-2 rounded-lg px-1.5 py-1 text-xs">
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {status === "running" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--air-head)]" />
                ) : status === "done" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : status === "failed" ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--bad)]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <span className={cn(STEP_TONE[status])}>{state.labels[key]}</span>
                {status === "skipped" && (
                  <span className="ml-1.5 text-[10px] text-[color:var(--air-label)]">
                    o&apos;tkazib yuborildi
                  </span>
                )}
                {error && (
                  <p className="mt-0.5 text-[11px] text-[color:var(--bad)]">{error}</p>
                )}
              </div>
              {status === "failed" && !locked && !state.running && (
                <button
                  type="button"
                  onClick={() => onRetry(key)}
                  disabled={busy}
                  className="shrink-0 text-[11px] text-[color:var(--air-head)] underline-offset-2 hover:underline disabled:opacity-50"
                >
                  qayta
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
