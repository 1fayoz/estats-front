"use client";

import * as React from "react";
import { Loader2, RefreshCw, Sparkles, Target, Undo2, Wand2, ZoomIn } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError, mediaUrl, redoAiImages, revertAiImage } from "@/lib/api";
import type { AiDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

const SHOT_LABEL: Record<string, string> = {
  main: "Asosiy",
  angle: "Rakurs",
  detail: "Detal",
  scale: "Ishlatilishda",
};

/**
 * Rasmlar paneli.
 *
 * Bitta rasm o'rniga endi TO'PLAM: har rang uchun to'rt kadr
 * (asosiy, rakurs, detal, ishlatilishda) — bitta oq fondagi
 * surat "qanday ushlanadi", "kattaligi qancha" degan savollarga
 * javob bermaydi.
 *
 * Har rasmning ustida "qayta yasash" turadi va tepada
 * "hammasini". Ikkisi ATAYLAB ajratilgan: har rasm pul turadi
 * va sotuvchi qaysi biri qayta yasalayotganini aniq bilishi kerak.
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
  const [zoomIndex, setZoomIndex] = React.useState<number | null>(null);

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

  const revert = async (index: number) => {
    setBusy(index);
    try {
      onChange(await revertAiImage(draft.id, index));
      toast.success("Oldingi variantga qaytarildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const checkFor = (index: number) =>
    draft.imageChecks.find((c) => c.index === index) ?? draft.imageChecks[0];

  // Kadrlar RANG bo'yicha guruhlanadi: ko'p rangli tovarda har
  // rangning o'z to'plami bor va xaridor aynan o'zi tanlagan
  // rangni ko'rishi kerak.
  const groups = React.useMemo(() => {
    const map = new Map<string, number[]>();
    draft.images.forEach((_, index) => {
      const color = checkFor(index)?.color ?? "";
      map.set(color, [...(map.get(color) ?? []), index]);
    });
    return [...map.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.images, draft.imageChecks]);

  return (
    <div className="space-y-3">
      {draft.marketBrief && (
        <p className="flex items-start gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <b className="text-foreground">Bozorda nima yutyapti:</b> {draft.marketBrief}
          </span>
        </p>
      )}

      {/* ── AI rasmlari — rang bo'yicha guruhlangan ──────────── */}
      <div className="space-y-3">
        {groups.map(([color, indexes]) => (
          <div key={color || "_"}>
            {color && (
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                {color}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {indexes.map((index) => {
                const url = draft.images[index];
                const check = checkFor(index);
                const canRevert = draft.imageHistoryIndexes.includes(index);
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
                    {/* Kattalashtirib ko'rish — redo overlay'dan ALOHIDA,
                        aks holda rasmning ustiga bosish har doim
                        "qayta yasash"ni ishga tushirardi. */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomIndex(index);
                      }}
                      className="absolute right-1 top-1 z-10 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      title="Kattalashtirib ko'rish"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    {!locked && canRevert && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void revert(index);
                        }}
                        disabled={busy !== null || working}
                        className="absolute left-1 top-1 z-10 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-100"
                        title="Oldingi variantga qaytarish"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <figcaption className="mt-1 flex flex-col items-center gap-0.5">
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <Sparkles className="h-3 w-3" />
                        {SHOT_LABEL[check?.shot ?? ""] ?? "AI"}
                      </Badge>
                      {check && (
                        <span
                          className={cn(
                            "text-[10px] tabular-nums",
                            check.accepted ? "text-emerald-600" : "text-amber-600"
                          )}
                          title={check.problems.join("; ")}
                        >
                          sifat {check.score}/10 · bozor {check.marketFit}/10
                        </span>
                      )}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Sotuvchining o'z rasmlari ────────────────────── */}
        {draft.sourceImages.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              Siz yuklagan asl rasmlar
            </div>
            <div className="flex flex-wrap gap-3">
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
          </div>
        )}
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
              har rasm ~${draft.imagePriceUsd.toFixed(3)} · to&apos;plam ~$
              {draft.imageSetPriceUsd.toFixed(3)} ({Math.max(draft.images.length, 1)} ta)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Bitta rasmni qayta yasash uchun uning ustiga, kattalashtirish
            uchun lupa belgisini bosing. Qayta yasalgan rasm eskisini
            o&apos;chirmaydi — kerak bo&apos;lsa ↺ belgisi bilan oldingi
            variantga qaytarish mumkin.
          </p>
        </div>
      )}

      <Dialog open={zoomIndex !== null} onOpenChange={(open) => !open && setZoomIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            {zoomIndex !== null
              ? `AI rasm ${zoomIndex + 1} — kattalashtirilgan`
              : "AI rasm"}
          </DialogTitle>
          {zoomIndex !== null && draft.images[zoomIndex] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(draft.images[zoomIndex])}
              alt={`AI rasm ${zoomIndex + 1} — kattalashtirilgan`}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
