"use client";

import * as React from "react";
import { Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, mediaUrl, redoAiImages } from "@/lib/api";
import type { AiDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Rasmlar paneli.
 *
 * Har rasmning ustida "qayta yasash" turadi va tepada
 * "hammasini". Ikkisi ATAYLAB ajratilgan: har rasm ~$0.042 va
 * beshta rasmni qayta yasash besh barobar qimmat — sotuvchi
 * qaysi biri qayta yasalayotganini aniq bilishi kerak.
 *
 * Sotuvchining o'z ko'rsatmasi ham shu yerda. U tovarni ko'rgan,
 * model esa faqat rasmni — shuning uchun uning so'zi promptda
 * ustun keladi.
 */
export function ImagePanel({
  draft,
  onChange,
  locked,
}: {
  draft: AiDraft;
  onChange: (draft: AiDraft) => void;
  locked: boolean;
}) {
  const [extra, setExtra] = React.useState(draft.imagePromptExtra ?? "");
  const [busy, setBusy] = React.useState<number | "all" | null>(null);

  React.useEffect(() => {
    setExtra(draft.imagePromptExtra ?? "");
  }, [draft.id, draft.imagePromptExtra]);

  const working = draft.stage === "images";

  const redo = async (index: number | null) => {
    setBusy(index === null ? "all" : index);
    try {
      onChange(await redoAiImages(draft.id, { prompt: extra.trim(), index }));
      toast.success(
        index === null ? "Hamma rasm qayta yasalmoqda…" : "Rasm qayta yasalmoqda…"
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const checkFor = (index: number) =>
    draft.imageChecks.find((c) => c.index === index) ?? draft.imageChecks[0];

  return (
    <div className="space-y-3">
      {/* ── AI rasmlari ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {draft.images.map((url, index) => {
          const check = checkFor(index);
          return (
            <figure key={url} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(url)}
                alt={`AI rasm ${index + 1}`}
                className="h-32 w-32 rounded-lg border object-cover"
              />
              {!locked && (
                <button
                  type="button"
                  onClick={() => void redo(index)}
                  disabled={busy !== null || working}
                  className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-100"
                >
                  {busy === index || working ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5" /> Qayta
                    </span>
                  )}
                </button>
              )}
              <figcaption className="mt-1 flex items-center justify-center gap-1">
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Sparkles className="h-3 w-3" /> AI
                </Badge>
                {check && (
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      check.accepted ? "text-emerald-600" : "text-amber-600"
                    )}
                    title={check.problems.join("; ")}
                  >
                    {check.score}/10
                  </span>
                )}
              </figcaption>
            </figure>
          );
        })}

        {/* ── Sotuvchining o'z rasmlari ────────────────────── */}
        {draft.sourceImages.map((url, index) => (
          <figure key={url}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(url)}
              alt={`Yuklangan rasm ${index + 1}`}
              className="h-32 w-32 rounded-lg border object-cover opacity-70"
            />
            <figcaption className="mt-1 text-center text-[10px] text-muted-foreground">
              asl
            </figcaption>
          </figure>
        ))}
      </div>

      {draft.imageNote && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-muted-foreground">
          {draft.imageNote}
        </p>
      )}

      {/* ── Qayta yasash ────────────────────────────────────── */}
      {!locked && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Wand2 className="h-3.5 w-3.5" /> Qayta yasash
          </div>
          <Input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="O'z ko'rsatmangiz: «fon issiqroq», «yon tomondan», «qutisi bilan»"
            maxLength={500}
            className="text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void redo(null)}
              disabled={busy !== null || working}
              className="gap-1.5"
            >
              {busy === "all" || working ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {draft.images.length > 1 ? "Hammasini qayta yasash" : "Qayta yasash"}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              {/*
                Narx ochiq aytiladi. Rasm quvurdagi eng qimmat qadam
                va sotuvchi buni tugmani bosishdan OLDIN bilishi kerak.
              */}
              har rasm ~${draft.imagePriceUsd.toFixed(3)} ·{" "}
              {Math.max(draft.images.length, 1)} ta yasaladi
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Bitta rasmni qayta yasash uchun uning ustiga bosing.
          </p>
        </div>
      )}
    </div>
  );
}
