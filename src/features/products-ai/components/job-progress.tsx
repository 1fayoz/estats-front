"use client";

/*
 * Fondagi AI yurishining TO'LIQ holati (sotuvchi, 2026-09-30, #27: «ma'nosiz
 * progress — qancha vaqtda tugashi, nima ko'p vaqt olayotgani ko'rinsin»):
 *   - hozirgi qadam, uning ichidagi hisob («3/10») va qancha vaqtdan beri;
 *   - brauzer hisobi band bo'lsa AYNAN qaysi ish bilan va qachondan beri navbatda;
 *   - server qayta ishga tushgan bo'lsa — bajarilganlar saqlanib davom etayotgani;
 *   - hamma qadamlar (tayyor / hozir / navbatda / xato) va taxminiy tugash vaqti.
 * Manba — `GET /product-ai/drafts/{id}/image-job` (backend `job_view`).
 */

import * as React from "react";
import { AlertTriangle, Check, Clock, Loader2, RotateCcw, X } from "lucide-react";

import { fetchAiImageJob, type AiImageJob } from "@/lib/api";
import { cn } from "@/lib/utils";

const PROVIDER: Record<string, string> = {
  gemini_web: "Gemini brauzeri",
  gemini_web_2: "Gemini brauzeri (2-hisob)",
  chatgpt_web: "ChatGPT brauzeri",
};

/** Holatni so'rab turadi; vaqtlarni server soatiga moslab har soniya yangilaydi. */
export function useDraftJob(draftId: number | undefined, active: boolean) {
  const [job, setJob] = React.useState<AiImageJob | null>(null);
  const running = Boolean(job?.running);
  const [now, setNow] = React.useState(() => Date.now());
  const fetchedAt = React.useRef(Date.now());
  const skew = React.useRef(0);

  React.useEffect(() => {
    if (!draftId || !active) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const next = await fetchAiImageJob(draftId);
        if (stop) return;
        fetchedAt.current = Date.now();
        if (next.serverTime) skew.current = Date.parse(next.serverTime) - Date.now();
        setJob(next);
        if (!stop) timer = setTimeout(tick, next.running ? 3000 : 15000);
        return;
      } catch {
        /* keyingi urinishda */
      }
      if (!stop) timer = setTimeout(tick, 5000);
    };
    void tick();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [draftId, active]);

  React.useEffect(() => {
    if (!active || !running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, running]);

  const serverNow = now + skew.current;
  const since = (iso?: string | null) => (iso ? Math.max(0, (serverNow - Date.parse(iso)) / 1000) : 0);
  const eta = job?.running && job.etaSeconds
    ? Math.max(0, Math.round(job.etaSeconds - (now - fetchedAt.current) / 1000))
    : 0;
  return { job, since, eta };
}

/** «2 soat 5 daq», «4 daq», «35 s» */
export function formatSpan(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} daq`;
  const h = Math.floor(m / 60);
  return `${h} soat${m % 60 ? ` ${m % 60} daq` : ""}`;
}

function etaText(eta: number): string {
  // Taxmin tugab qolgan, lekin ish davom etyapti — «0 qoldi» yolg'on bo'lardi.
  if (eta <= 0) return "oz qoldi";
  return `~${formatSpan(eta)} qoldi`;
}

/** Burchakdagi panel uchun bir qator: «Qadam 3/10 · 12 daq · navbatda … · ~25 daq qoldi». */
export function JobLine({ draftId, fallback }: { draftId: number; fallback: string }) {
  const { job, since, eta } = useDraftJob(draftId, true);
  if (!job?.running || !job.currentLabel) return <>{fallback}</>;
  const wait = job.waiting;
  const many = (job.runningSteps?.length ?? 0) > 1;
  const parts = [
    many
      ? (job.runningSteps ?? []).map((r) => r.label).join(" + ")
      : `${job.currentLabel}${job.detail ? ` ${job.detail}` : ""}`,
    formatSpan(since(job.stepStartedAt)),
    wait ? `navbatda${wait.ahead ? ` (${wait.ahead + 1}-o'rin)` : ""}: ${wait.holder || "boshqa ish"}` : "",
    etaText(eta),
  ].filter(Boolean);
  return <span title={parts.join(" · ")}>{parts.join(" · ")}</span>;
}

/** Oyna ichidagi to'liq ko'rinish — bosqichlar chizig'i ostida, yurish ketayotganda. */
export function JobProgress({ draftId, active }: { draftId: number; active: boolean }) {
  const { job, since, eta } = useDraftJob(draftId, active);
  if (!active || !job?.running) return null;
  const steps = job.steps ?? [];
  const done = steps.filter((s) => s.status === "done").length;
  // Eski backend `runningSteps` bermaydi — hozirgi qadamning o'zi.
  const running = job.runningSteps?.length
    ? job.runningSteps
    : [{ key: job.current ?? "", label: job.currentLabel ?? "Tayyorlanmoqda",
         startedAt: job.stepStartedAt, waiting: job.waiting ?? null }];

  return (
    <div className="rounded-xl border bg-card px-3 py-2.5 text-xs" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" aria-hidden />
        <span className="min-w-0 flex-1 font-medium">
          {running.length > 1 ? `Parallel: ${running.length} ta qadam` : (job.currentLabel || "Tayyorlanmoqda")}
          {running.length <= 1 && job.detail ? <span className="text-muted-foreground">{` · ${job.detail}`}</span> : null}
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {`${done}/${steps.length} qadam · `}
          <span className="font-semibold text-primary">{etaText(eta)}</span>
        </span>
      </div>

      {/* Har ishlayotgan qadam — o'z qatorida: qancha vaqtdan beri va nimani kutyapti. */}
      <ul className="mt-2 space-y-1">
        {running.map((r) => (
          <li key={r.key} className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
            <span className="font-medium">{r.label}</span>
            {r.startedAt ? <span className="text-muted-foreground">{`${formatSpan(since(r.startedAt))} dan beri`}</span> : null}
            {r.waiting ? (
              <span className="inline-flex items-start gap-1 text-[color:var(--warn)]">
                <Clock className="mt-0.5 size-3 shrink-0" aria-hidden />
                {`${PROVIDER[r.waiting.provider] ?? "AI hisobi"} band: ${r.waiting.holder || "boshqa AI ishi"}${r.waiting.ahead ? `, oldinda yana ${r.waiting.ahead} ta` : ""}`}
              </span>
            ) : (
              <span className="text-[color:var(--ok)]">ishlamoqda</span>
            )}
          </li>
        ))}
      </ul>
      {(job.resumes ?? 0) > 0 && (
        <p className="mt-2 flex items-start gap-1.5 text-muted-foreground">
          <RotateCcw className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {`Server qayta ishga tushgan edi — bajarilgan qadamlar saqlanib, shu joydan davom etmoqda (${job.resumes} marta).`}
        </p>
      )}

      <ol className="mt-2 flex flex-wrap gap-1.5" aria-label="AI qadamlari">
        {steps.map((s) => (
          <li
            key={s.key}
            title={s.error || undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]",
              s.status === "done" && "border-emerald-500/25 bg-emerald-500/10 text-[color:var(--ok)]",
              s.status === "running" && "border-primary/40 bg-primary/10 font-medium text-primary",
              (s.status === "failed" || s.status === "skipped") && "border-destructive/30 bg-destructive/5 text-destructive",
              s.status === "pending" && "text-muted-foreground",
            )}
          >
            {s.status === "done" && <Check className="size-3" aria-hidden />}
            {s.status === "running" && <Loader2 className="size-3 animate-spin" aria-hidden />}
            {s.status === "failed" && <X className="size-3" aria-hidden />}
            {s.status === "skipped" && <AlertTriangle className="size-3" aria-hidden />}
            {s.label}
          </li>
        ))}
      </ol>
      {job.startedAt && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {`Jami: ${formatSpan(since(job.startedAt))} · taxmin qadamlarning o'lchangan o'rtacha vaqtidan`}
        </p>
      )}
    </div>
  );
}
