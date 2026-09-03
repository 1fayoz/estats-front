"use client";

import * as React from "react";
import {
  Check, Loader2, Palette, Plus, RefreshCw, Sparkles, Target, Undo2, Wand2, X, ZoomIn,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError, mediaUrl, patchAiDraft, redoAiImages, revertAiImage } from "@/lib/api";
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
  const [busy, setBusy] = React.useState<number | "all" | `c:${string}` | null>(null);
  const [zoomIndex, setZoomIndex] = React.useState<number | null>(null);
  const [savingColors, setSavingColors] = React.useState(false);

  React.useEffect(() => {
    setExtra(draft.imagePromptExtra ?? "");
  }, [draft.id, draft.imagePromptExtra]);

  const working = draft.stage === "images";

  // Rasm rejasini belgilaydigan ranglar — AI rasmdan o'qigan, lekin
  // sotuvchi tuzatishi mumkin (`vision.colors`).
  const visionColors = React.useMemo(() => {
    const raw = (draft.vision as { colors?: unknown } | null)?.colors;
    return Array.isArray(raw) ? raw.map(String).map((s) => s.trim()).filter(Boolean) : [];
  }, [draft.vision]);

  // Ranglar 3 tagacha rasm to'plamiga aylanadi (backend `plan_for`).
  const plannedColorCount = Math.min(visionColors.length, 3);
  const colorsOutOfSync =
    draft.images.length > 0 &&
    plannedColorCount > 0 &&
    draft.images.length !== plannedColorCount * 4;

  const redo = async (target: { index?: number | null; color?: string }) => {
    const token: number | "all" | `c:${string}` = target.color
      ? `c:${target.color}`
      : target.index == null
        ? "all"
        : target.index;
    setBusy(token);
    try {
      onChange(
        await redoAiImages(draft.id, {
          prompt: extra.trim(),
          ...(target.color ? { color: target.color } : { index: target.index ?? null }),
        })
      );
      toast.success(
        target.color
          ? `«${target.color}» rangi qayta yasalmoqda…`
          : target.index == null
            ? "Hamma rasm qayta yasalmoqda…"
            : "Rasm qayta yasalmoqda…"
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const saveColors = async (next: string[]) => {
    // Takror va bo'shlarni tozalab yuboramiz — backend ham qiladi,
    // lekin interfeys darhol to'g'ri ko'rinsin.
    const clean: string[] = [];
    for (const c of next.map((s) => s.trim()).filter(Boolean)) {
      if (!clean.some((x) => x.toLowerCase() === c.toLowerCase())) clean.push(c);
    }
    setSavingColors(true);
    try {
      onChange(await patchAiDraft(draft.id, { vision: { colors: clean } }));
      toast.success("Ranglar saqlandi — rasmlarni qayta yasang.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setSavingColors(false);
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
    draft.images.forEach((url, index) => {
      // Rang o'chirilgach reja o'rtasida bo'sh joy qolishi mumkin
      // (`_recolor`) — bo'sh kadr ko'rsatilmaydi, sotuvchi «shu
      // rangni qayta yasash» bilan to'ldiradi.
      if (!url) return;
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

      {/* ── Ranglar — rasm rejasini shular belgilaydi ────────── */}
      {!locked && (
        <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Palette className="h-3.5 w-3.5" /> Ranglar
            {savingColors && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          <ColorsEditor
            colors={visionColors}
            disabled={savingColors || working}
            onSave={saveColors}
          />
          <p className="text-[11px] text-muted-foreground">
            Har rang uchun 4 kadr yasaladi (3 rangdan ko&apos;pi olinmaydi).
            AI rangni rasmdan o&apos;qiydi — noto&apos;g&apos;ri bo&apos;lsa shu
            yerda tuzating, so&apos;ng «{plannedColorCount > 1 ? "shu rangni" : "qayta"}
            {" "}yasash» bilan yangilang.
          </p>
        </div>
      )}

      {colorsOutOfSync && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-muted-foreground">
          Ranglar ({plannedColorCount}) rasm to&apos;plami bilan mos emas —
          «Hammasini qayta yasash» bilan yangilang.
        </p>
      )}

      {/* ── AI rasmlari — rang bo'yicha guruhlangan ──────────── */}
      <div className="space-y-3">
        {groups.map(([color, indexes]) => (
          <div key={color || "_"}>
            {color && (
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {color}
                </span>
                {!locked && visionColors.some((c) => c === color) && (
                  <button
                    type="button"
                    onClick={() => void redo({ color })}
                    disabled={busy !== null || working}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-foreground disabled:opacity-50"
                  >
                    {busy === `c:${color}` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    shu rangni qayta yasash
                  </button>
                )}
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
                        onClick={() => void redo({ index })}
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
              onClick={() => void redo({})}
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

/**
 * Ranglarni tahrirlash — chip'lar: bosib nomini o'zgartirish, ✕ bilan
 * o'chirish, pastdagi maydondan qo'shish. Har o'zgarishda `onSave`
 * to'liq ro'yxatni yuboradi (backend `patch_draft` merge qiladi).
 */
function ColorsEditor({
  colors,
  disabled,
  onSave,
}: {
  colors: string[];
  disabled: boolean;
  onSave: (next: string[]) => void | Promise<void>;
}) {
  const [editing, setEditing] = React.useState<number | null>(null);
  const [draftValue, setDraftValue] = React.useState("");
  const [adding, setAdding] = React.useState("");

  const commitEdit = (i: number) => {
    const v = draftValue.trim();
    setEditing(null);
    if (!v || v === colors[i]) return;
    onSave(colors.map((c, idx) => (idx === i ? v : c)));
  };

  const remove = (i: number) => onSave(colors.filter((_, idx) => idx !== i));

  const add = () => {
    const v = adding.trim();
    setAdding("");
    if (!v) return;
    onSave([...colors, v]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {colors.map((color, i) =>
        editing === i ? (
          <span key={i} className="inline-flex items-center gap-1">
            <Input
              autoFocus
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onBlur={() => commitEdit(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit(i);
                if (e.key === "Escape") setEditing(null);
              }}
              maxLength={60}
              className="h-7 w-28 text-xs"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commitEdit(i)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setDraftValue(color);
                setEditing(i);
              }}
              className="hover:underline disabled:no-underline"
            >
              {color}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive disabled:opacity-50"
              aria-label={`${color} — o'chirish`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )
      )}
      <span className="inline-flex items-center gap-1">
        <Input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
            if (e.key === "Escape") setAdding("");
          }}
          disabled={disabled}
          placeholder="+ rang"
          maxLength={60}
          className="h-7 w-24 text-xs"
        />
        {adding.trim() && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={add}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}
