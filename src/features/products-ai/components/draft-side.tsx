"use client";

import * as React from "react";
import { AlertTriangle, Check, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AI_STAGES, activeIndex, doneIndex } from "@/features/products-ai/stages";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/**
 * Modalning o'ng ustuni — namunadagi voqealar lentasi o'rnida.
 *
 * Bitrix'da u yerda "nima qilish kerak" turadi; bizda esa AI
 * NIMA QILGANI: har qadam alohida qator, tugagani belgilangan,
 * hozirgisi aylanib turadi. Bu bezak emas — quvur bir necha o'n
 * soniya ketadi va har qadami pul turadi, ya'ni "qayerda qoldi"
 * degan savolga javob doim ko'rinib turishi kerak.
 */
export function DraftSide({
  draft,
  onRetry,
  retrying,
}: {
  draft: AiDraft | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  if (!draft) return <NewHint />;

  const done = doneIndex(draft);
  const active = activeIndex(draft);
  const running = active !== null;

  return (
    <div className="space-y-4">
      {running && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{draft.stageLabel}</span>
            <span className="tabular-nums text-muted-foreground">{draft.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${draft.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Oynani yopsangiz ham ishlayveradi — natija ro&apos;yxatda paydo bo&apos;ladi.
          </p>
        </div>
      )}

      {draft.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <div className="font-medium">Quvur to&apos;xtadi</div>
              <p className="text-muted-foreground">{draft.error}</p>
            </div>
          </div>
          {/* Davom ettirish NOLDAN emas: bajarilgan qadamlar
              saqlangan va ular uchun pul to'langan. */}
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            disabled={retrying}
            className="mt-2.5 w-full gap-1.5"
          >
            {retrying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            To&apos;xtagan joydan davom ettirish
          </Button>
        </div>
      )}

      <ol className="space-y-0.5">
        {AI_STAGES.map((stage, index) => {
          const isDone = index <= done;
          const isActive = index === active;
          return (
            <li
              key={stage.key}
              className={cn(
                "flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-[13px]",
                isActive && "bg-primary/10",
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {isDone ? (
                  <Check className="h-3.5 w-3.5 air-ok" />
                ) : isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span className={cn(!isDone && !isActive && "text-muted-foreground")}>
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>

      <dl className="space-y-1.5 border-t pt-3 text-[13px]">
        <Fact
          label="Tavsiya narx"
          value={draft.suggestedPrice ? formatSum(draft.suggestedPrice) : "—"}
        />
        <Fact
          label="Raqobatchi"
          value={draft.market?.rivals.length ? `${draft.market.rivals.length} ta` : "—"}
        />
        {draft.market?.priceMin && draft.market.priceMax ? (
          <Fact
            label="Bozor narxi"
            value={`${formatNumber(draft.market.priceMin)} – ${formatNumber(draft.market.priceMax)}`}
          />
        ) : null}
        <Fact label="Xususiyat" value={`${Object.keys(draft.attributes).length} ta`} />
        <Fact label="Kalit so'z" value={`${draft.keywords.length} ta`} />
      </dl>

      {draft.imageNote && (
        <p className="air-notice rounded-lg p-2.5 text-xs">{draft.imageNote}</p>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

/** Hali qoralama yo'q: AI nima qilishini oldindan aytib qo'yish. */
function NewHint() {
  return (
    <div className="space-y-3 text-[13px]">
      <div className="font-medium">Rasmdan keyin nima bo&apos;ladi</div>
      <ol className="space-y-0.5">
        {AI_STAGES.slice(1).map((stage) => (
          <li key={stage.key} className="flex items-start gap-2.5 px-2 py-1.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">{stage.label}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        Bir necha o&apos;n soniya ketadi. Oynani yopsangiz ham to&apos;xtamaydi.
      </p>
      <p className="text-xs text-muted-foreground">
        Matn qismi bir tiyin turadi; qimmati — rasm yasash (~$0.042). OpenAI
        kaliti kiritilmagan bo&apos;lsa rasm qadami jimgina o&apos;tkaziladi va
        qolgani baribir tayyor bo&apos;ladi.
      </p>
    </div>
  );
}
