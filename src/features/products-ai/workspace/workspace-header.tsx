"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, ImagePlus, Loader2, PackagePlus, Sparkles, Store } from "lucide-react";

import { TopbarSlot } from "@/components/layout/topbar-slot";
import { Button } from "@/components/ui/button";
import { AI_STAGES, activeIndex, doneIndex } from "@/features/products-ai/stages";
import {
  EDIT_STAGE_LABEL,
  PUBLISH_PHASES,
  editPhaseState,
  editPhases,
  publishPhaseState,
  type PublishPhaseState,
} from "@/features/products-ai/publish-stages";
import { JobProgress } from "@/features/products-ai/components/job-progress";
import { SplitProgress } from "@/features/products-ai/components/split-dialog";
import { mediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

import {
  EDIT_STATUS_LABEL, FAILED_PUBLISH, PUBLISH_STAGE_LABEL, PUBLISH_STATUS_LABEL, SHOP_PUBLISH_STOPS,
  draftShop, imageCostText, imageEngineOf,
} from "./lib";
import styles from "./workspace.module.css";

/** Progress halqasi — SVG, faqat `stroke-dashoffset` o'zgaradi (kompozitor). */
function ProgressRing({ value, state }: { value: number; state: "running" | "done" | "failed" | "idle" }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.ring} role="img" aria-label={`Tayyorlik ${clamped}%`}>
      <svg viewBox="0 0 72 72" aria-hidden>
        <circle className={styles.ringTrack} cx="36" cy="36" r={r} />
        <circle
          className={styles.ringBar}
          data-state={state}
          cx="36"
          cy="36"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c - (c * clamped) / 100}
        />
      </svg>
      <span className={styles.ringLabel}>
        {state === "done" ? <Check className="size-5 text-[color:var(--ok)]" aria-hidden /> : `${clamped}%`}
      </span>
    </div>
  );
}

/** Umumiy bosqich yo'li — AI qadamlari va joylash fazalari BITTA ko'rinishda. */
export function Track({
  items,
  label,
}: {
  items: { key: string; short: string; label: string; state: PublishPhaseState | "done" | "active" | "failed" | "next" }[];
  label: string;
}) {
  return (
    <ol className={styles.track} aria-label={label}>
      {items.map((item) => (
        <li key={item.key} className={styles.seg} data-state={item.state} title={item.label}>
          <div className={styles.segBar} />
          <div className={styles.segLabel}>{item.short}</div>
          <span className="sr-only">
            {item.label}: {item.state === "done" ? "tayyor" : item.state === "active" ? "bajarilmoqda" : item.state === "failed" ? "to'xtadi" : "kutilmoqda"}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** AI quvurining 7 qadami — holat `stage` emas, natija maydonlaridan (`stages.ts`). */
function AiTrack({ draft }: { draft: AiDraft | null }) {
  const done = draft ? doneIndex(draft) : -1;
  const active = draft ? activeIndex(draft) : 0;
  const failed = draft?.stage === "failed" || Boolean(draft?.error);
  return (
    <Track
      label="Kartochka tayyorlanishi"
      items={AI_STAGES.map((stage, index) => ({
        key: stage.key,
        short: stage.short,
        label: stage.label,
        state:
          index <= done ? "done"
            : failed && index === done + 1 ? "failed"
              : index === active ? "active"
                : "next",
      }))}
    />
  );
}

/**
 * Uzum'ga joylash / yangilash fazalari — AI yo'lining O'RNIDA (ikkalasi bir
 * vaqtda ko'rinmaydi). Natijadan keyin ham qoladi: muvaffaqiyatsiz urinish
 * qaysi fazada to'xtagani keyin ochganda ham ko'rinsin.
 */
function PublishTrack({ draft }: { draft: AiDraft }) {
  const publish = draft.uzumPublish!;
  const status = publish.status;
  const publishing = status === "queued" || status === "running";
  const editing = publish.kind === "edit";
  const phases = editing ? editPhases(publish.replaceImages) : PUBLISH_PHASES;
  const stageLabel = (stage: string) => (editing ? EDIT_STAGE_LABEL[stage] : PUBLISH_STAGE_LABEL[stage]) ?? stage;
  const lastLog = publish.log?.length ? publish.log[publish.log.length - 1] : "";
  const stage = publish.stage;

  let note: React.ReactNode;
  if (publishing && stage) {
    note = (
      <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs" aria-live="polite">
        <Loader2 className="size-3.5 animate-spin text-[color:var(--primary)]" aria-hidden />
        <span className="font-medium">{stageLabel(stage)}…</span>
        <span className="tabular-nums text-[color:var(--air-label)]">{publish.progress ?? 0}%</span>
        {editing && lastLog && lastLog !== stageLabel(stage) && (
          <span className="max-w-full truncate text-[color:var(--air-label)]" title={lastLog}>hozir: {lastLog}</span>
        )}
      </p>
    );
  } else {
    const text = editing && EDIT_STATUS_LABEL[status]
      ? `${EDIT_STATUS_LABEL[status]}${status !== "published" && publish.message ? ` — ${publish.message}` : ""}`
      : status === "published" && publish.uzumShopTitle
        ? `«${publish.uzumShopTitle}» do'koniga joylandi ✓`
        : SHOP_PUBLISH_STOPS.has(status) && publish.message
          ? publish.message
          : PUBLISH_STATUS_LABEL[status] ?? publish.message;
    const total = publish.timings ? Object.values(publish.timings).reduce((a, b) => a + b, 0) / 1000 : 0;
    note = (
      <p className={cn("text-center text-xs", status === "published" ? "air-ok" : FAILED_PUBLISH.has(status) ? "air-bad" : "air-warn")}>
        {text}
        {status === "published" && total > 0 && (
          <span className="ml-1 text-[color:var(--air-label)]">(jami {total.toFixed(1)} s)</span>
        )}
      </p>
    );
  }

  return (
    <>
      <Track
        label={editing ? "Uzum'da yangilash" : "Uzum'ga joylash"}
        items={phases.map((phase) => ({
          key: phase.key,
          short: phase.short,
          label: phase.label,
          state: editing ? editPhaseState(phase, publish, publishing) : publishPhaseState(phase, publish, publishing),
        }))}
      />
      <div className="px-5 pb-4">{note}</div>
    </>
  );
}

/**
 * Sahifa sarlavhasi: muqova, nom, holat chiplari, progress halqasi va
 * BITTA bosqich yo'li (AI qadamlari yoki joylash fazalari — navbat bilan).
 */
export function WorkspaceHeader({
  draft,
  loading,
  onDraft,
}: {
  draft: AiDraft | null;
  loading: boolean;
  onDraft: (draft: AiDraft) => void;
}) {
  const publishStatus = draft?.uzumPublish?.status || null;
  const showPublish = Boolean(publishStatus && publishStatus !== "linked");
  const running = Boolean(draft && draft.progress < 100 && !draft.error);
  const failed = Boolean(draft?.error || draft?.stage === "failed");
  const ringState = failed ? "failed" : running ? "running" : draft?.progress === 100 ? "done" : "idle";
  const cover = draft?.images?.[0] || draft?.sourceImages?.[0] || null;
  const shop = draft ? draftShop(draft) : null;
  const live = Boolean(draft?.uzumPublish?.productId);
  const cost = imageCostText(draft);

  return (
    <>
      <TopbarSlot>
        <Button asChild variant="outline" size="sm" className="air-control gap-2 text-white hover:text-white">
          <Link href="/warehouse" aria-label="Omborga qaytish">
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="hidden sm:inline">Omborga qaytish</span>
          </Link>
        </Button>
      </TopbarSlot>

      <header className={cn(styles.card, styles.rise)} style={{ "--i": 0 } as React.CSSProperties}>
        <div className={styles.hero}>
          <div className="flex min-w-0 items-center gap-4">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(cover)} alt="" className={styles.cover} />
            ) : (
              <span className={cn(styles.cover, "grid place-items-center text-[color:var(--ok)]")}>
                {draft ? <Sparkles className="size-6" aria-hidden /> : <PackagePlus className="size-6" aria-hidden />}
              </span>
            )}
            <div className="min-w-0">
              <h1 className={styles.title}>
                {loading ? "Qoralama ochilmoqda…" : draft?.titleUz?.trim() || (draft ? "Nomsiz tovar" : "Yangi tovar")}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {draft ? (
                  <>
                    <span className={styles.chip}>#{draft.id}</span>
                    <span
                      className={cn(
                        styles.chip,
                        failed ? styles.chipBad : running ? styles.chipInfo : draft.stage === "approved" ? styles.chipOk : undefined,
                      )}
                    >
                      {running && <Loader2 className="size-3 animate-spin" aria-hidden />}
                      {draft.stageLabel}
                    </span>
                    {live && <span className={cn(styles.chip, styles.chipOk)}><Check className="size-3" aria-hidden /> Uzum'da · {draft.uzumPublish?.productId}</span>}
                    {shop?.title && <span className={styles.chip}><Store className="size-3" aria-hidden /> {shop.title}</span>}
                    <span className={cn(styles.chip, imageEngineOf(draft) === "web" && styles.chipOk)} title={cost.hint}>
                      <ImagePlus className="size-3" aria-hidden />
                      {cost.paid ? `rasm ${cost.text} / kadr` : `rasm — ${cost.text}`}
                    </span>
                  </>
                ) : (
                  <span className={styles.chip}>Rasm yuklang — qolganini AI tayyorlaydi</span>
                )}
              </div>
            </div>
          </div>
          {draft && <ProgressRing value={draft.progress} state={ringState} />}
        </div>

        {draft && showPublish ? <PublishTrack draft={draft} /> : <AiTrack draft={draft} />}

        {draft && (
          <div className="space-y-3 px-5 pb-4 empty:hidden">
            <JobProgress draftId={draft.id} active />
            {draft.split?.auto && <SplitProgress draft={draft} onChange={onDraft} />}
          </div>
        )}
      </header>
    </>
  );
}
