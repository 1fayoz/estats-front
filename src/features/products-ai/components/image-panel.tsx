"use client";

import * as React from "react";
import { Check, Loader2, Palette, Plus, Sparkles, Target, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { ImageStudio, ImageTile, type StudioItem } from "@/features/products-ai/components/image-studio";
import { ApiError, excludeAiImage, mediaUrl, patchAiDraft, redoAiImages, revertAiImage } from "@/lib/api";
import type { AiDraft } from "@/lib/types";

/** Kadr turi → sotuvchi tushunadigan nom (backend `strategy.IMAGE_TYPES`, `card_content.IMAGE_SLOTS`). */
const TYPE_LABEL: Record<string, string> = {
  asosiy: "Muqova",
  infografika: "Infografika",
  detal: "Detal",
  olcham: "Oʻlcham",
  komplekt: "Komplekt",
  ishlatilishda: "Ishlatilishda",
  yoriqnoma: "Yoʻriqnoma",
  solishtirish: "Afzalliklar",
  qadoq: "Qadoq",
  main: "Asosiy",
  angle: "Rakurs",
  detail: "Detal",
  scale: "Ishlatilishda",
  tavsif_sifat: "Sifat",
  tavsif_xususiyat: "Xususiyatlar",
  tavsif_foyda: "Foyda",
  tavsif_afzallik: "Afzalliklar",
  bolim_setka: "Oʻlchamli setka",
  bolim_tarkib: "Tarkib",
  bolim_yoriqnoma: "Yoʻriqnoma",
};

/** Joy → shu joy kadrlarining slot nomlari (backend `card_content.IMAGE_SLOTS` tartibida). */
const CONTENT_PLACES: { key: "description" | "size" | "composition" | "usage"; label: string; slots: string[] }[] = [
  { key: "description", label: "Tavsif uchun", slots: ["tavsif_sifat", "tavsif_xususiyat", "tavsif_foyda", "tavsif_afzallik"] },
  { key: "size", label: "Oʻlchamli setka", slots: ["bolim_setka"] },
  { key: "composition", label: "Tarkib", slots: ["bolim_tarkib"] },
  { key: "usage", label: "Foydalanish yoʻriqnomasi", slots: ["bolim_yoriqnoma"] },
];

const GALLERY_FILE = /\/ai-(\d+)-([a-z_]+?)(?:-[0-9a-f]{6})?\.jpe?g$/i;
const CONTENT_FILE = /\/aic-([a-z_]+)-[0-9a-f]+\.jpe?g$/i;

/**
 * Rasmlar paneli.
 *
 * Sotuvchi talabi (2026-09-15): AI tokenini tejash uchun rasm FAQAT
 * bittalab qayta yasaladi — «Hammasini qayta yasash» va «shu rangni qayta
 * yasash» olib tashlandi. Rasm ustiga bosish uni katta ochadi; o'sha
 * oynada «Olib tashlash»/«Tiklash», «Oldingi variant» va tasdiq bilan
 * «Qayta yasash» (qo'shimcha ko'rsatma bilan). Qayta yasalgan kadr o'z
 * o'rnining turiga (muqova, o'lcham, infografika…) mos chiqadi — backend
 * rejadagi o'rinni oladi.
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
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [savingColors, setSavingColors] = React.useState(false);
  const pending = React.useRef<{ id: string; at: string | undefined } | null>(null);

  const working = draft.stage === "images";
  const plan = draft.intelligence?.image_plan;
  const intelligencePlan = Boolean(plan?.images?.length);
  const removed = React.useMemo(() => new Set(draft.removedImages ?? []), [draft.removedImages]);

  // Rasm rejasini belgilaydigan ranglar — AI rasmdan o'qigan, lekin
  // sotuvchi tuzatishi mumkin (`vision.colors`).
  const visionColors = React.useMemo(() => {
    const raw = (draft.vision as { colors?: unknown } | null)?.colors;
    return Array.isArray(raw) ? raw.map(String).map((c) => c.trim()).filter(Boolean) : [];
  }, [draft.vision]);

  // Yasash tugadi (bosqich `images` dan chiqdi) — natijani aytamiz.
  const partialAt = draft.intelligence?.partial?.at;
  React.useEffect(() => {
    const job = pending.current;
    if (!job || working) return;
    pending.current = null;
    setBusyId(null);
    const partial = draft.intelligence?.partial;
    if (partial && partial.at !== job.at) {
      if (partial.status === "failed") toast.error(partial.error || "Rasm yasalmadi.");
      else toast.success("Rasm yangilandi.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [working, partialAt]);

  const items = React.useMemo<StudioItem[]>(() => {
    const plannedByPosition = new Map((plan?.images ?? []).map((p) => [p.position, p]));
    const orderedPlan = [...(plan?.images ?? [])].sort((a, b) => a.position - b.position);
    const gallery: StudioItem[] = draft.images.flatMap((url, index) => {
      if (!url) return [];
      const match = url.match(GALLERY_FILE);
      const position = match ? Number(match[1]) : orderedPlan[index]?.position ?? index;
      const planned = plannedByPosition.get(position) ?? orderedPlan[index];
      const check =
        draft.imageChecks.find((c) => c.index === (intelligencePlan ? position : index)) ?? null;
      const type = match?.[2] ?? planned?.type ?? check?.shot ?? "";
      return [{
        id: `g:${index}`,
        url,
        group: `Galereya · ${index + 1}-rasm`,
        label: TYPE_LABEL[type] ?? (url.includes("/uzum-") ? "Uzum'dan" : "Rasm"),
        purpose: planned?.goal || planned?.purpose || undefined,
        kind: { type: "gallery", index },
        removed: removed.has(url),
        check: check ? { accepted: check.accepted, score: check.score, marketFit: check.marketFit, problems: check.problems } : null,
        canRevert: draft.imageHistoryIndexes.includes(index),
      }];
    });
    if (!intelligencePlan) return gallery;

    const contentPlan = new Map((plan?.content_images ?? []).map((p) => [p.type, p]));
    const content: StudioItem[] = CONTENT_PLACES.flatMap((place) => {
      const urls = [...(draft.sectionImages?.[place.key] ?? [])];
      const bySlot = new Map<string, string>();
      for (const url of urls) {
        const slot = url.match(CONTENT_FILE)?.[1];
        if (slot && place.slots.includes(slot) && !bySlot.has(slot)) bySlot.set(slot, url);
      }
      // Nomidan slot o'qilmagan rasm (Uzum'dan olingan) — bo'sh slotlarga tartib bilan.
      const rest = urls.filter((url) => ![...bySlot.values()].includes(url));
      for (const slot of place.slots) if (!bySlot.has(slot) && rest.length) bySlot.set(slot, rest.shift()!);
      return place.slots.map((slot) => {
        const url = bySlot.get(slot) ?? null;
        return {
          id: `s:${slot}`,
          url,
          group: place.label,
          label: TYPE_LABEL[slot] ?? slot,
          purpose: contentPlan.get(slot)?.goal || undefined,
          kind: { type: "slot", slot },
          removed: url ? removed.has(url) : false,
          check: null,
          canRevert: false,
        } satisfies StudioItem;
      });
    });
    return [...gallery, ...content];
  }, [draft.images, draft.imageChecks, draft.imageHistoryIndexes, draft.sectionImages, plan, intelligencePlan, removed]);

  const gallery = items.filter((item) => item.kind.type === "gallery");
  const content = items.filter((item) => item.kind.type === "slot");
  const removedCount = items.filter((item) => item.removed).length;
  const missingCount = content.filter((item) => !item.url).length;

  const regenerate = async (item: StudioItem, prompt: string): Promise<boolean> => {
    try {
      const next = await redoAiImages(draft.id, {
        prompt,
        ...(item.kind.type === "gallery" ? { index: item.kind.index } : { slot: item.kind.slot }),
      });
      pending.current = { id: item.id, at: draft.intelligence?.partial?.at };
      setBusyId(item.id);
      onChange(next);
      toast.success(`«${item.label}» yasalmoqda — tugagach shu yerda ko'rinadi.`);
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
      return false;
    }
  };

  const toggleRemoved = async (item: StudioItem) => {
    if (!item.url) return;
    try {
      onChange(await excludeAiImage(draft.id, item.url, !item.removed));
      toast.success(item.removed ? "Rasm tiklandi — Uzum'ga ketadi." : "Olib tashlandi — Uzum'ga ketmaydi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    }
  };

  const revert = async (item: StudioItem) => {
    if (item.kind.type !== "gallery") return;
    try {
      onChange(await revertAiImage(draft.id, item.kind.index));
      toast.success("Oldingi variantga qaytarildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    }
  };

  const saveColors = async (next: string[]) => {
    const clean: string[] = [];
    for (const c of next.map((value) => value.trim()).filter(Boolean)) {
      if (!clean.some((x) => x.toLowerCase() === c.toLowerCase())) clean.push(c);
    }
    setSavingColors(true);
    try {
      onChange(await patchAiDraft(draft.id, { vision: { colors: clean } }));
      toast.success("Ranglar saqlandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setSavingColors(false);
    }
  };

  return (
    <div className="space-y-4">
      {draft.marketBrief && (
        <p className="flex items-start gap-2 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <b className="text-foreground">Bozorda nima yutyapti:</b> {draft.marketBrief}
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
        <p className="min-w-0 flex-1 leading-relaxed">
          {"Rasmni katta ko'rish, olib tashlash yoki qayta yasash uchun ustiga bosing. Har kadr alohida yasaladi — "}
          {`taxminan ${draft.imagePriceUsd ? `$${draft.imagePriceUsd.toFixed(3)}` : "bir necha sent"}.`}
        </p>
        <span className="flex flex-wrap gap-1.5">
          {removedCount > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
              {removedCount} ta olib tashlangan
            </span>
          )}
          {missingCount > 0 && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium air-warn">
              {missingCount} ta kadr yasalmagan
            </span>
          )}
        </span>
      </div>

      {working && (
        <p className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
          <Loader2 className="size-3.5 animate-spin" /> Rasm yasalmoqda — oynani yopsangiz ham davom etadi.
        </p>
      )}

      <section className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="size-3.5" /> Galereya
          <span className="font-normal normal-case tracking-normal">
            {`· ${gallery.filter((item) => !item.removed).length} ta Uzum'ga ketadi`}
          </span>
        </p>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
            {gallery.map((item) => (
              <ImageTile key={item.id} item={item} busy={busyId === item.id} onOpen={() => setOpenId(item.id)} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
            Galereya hali bo&apos;sh — kartochka AI bilan tayyorlanganda paydo bo&apos;ladi.
          </p>
        )}
      </section>

      {content.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {"Tavsif va bo'limlar uchun alohida rasmlar"}
          </p>
          {CONTENT_PLACES.map((place) => {
            const placeItems = content.filter((item) => item.group === place.label);
            return (
              <div key={place.key} className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {place.label} · {placeItems.filter((item) => item.url && !item.removed).length}/{place.slots.length}
                </p>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
                  {placeItems.map((item) => (
                    <ImageTile key={item.id} item={item} busy={busyId === item.id} onOpen={() => setOpenId(item.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {draft.sourceImages.length > 0 && (
        <section className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Siz yuklagan asl rasmlar</p>
          <div className="flex flex-wrap gap-2">
            {draft.sourceImages.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={mediaUrl(url)}
                alt={`Yuklangan rasm ${index + 1}`}
                className="h-20 w-16 rounded-lg border object-cover opacity-80"
              />
            ))}
          </div>
        </section>
      )}

      {draft.imageNote && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          {draft.imageNote}
        </p>
      )}

      {!locked && (
        <div className="space-y-1.5 rounded-xl border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Palette className="h-3.5 w-3.5" /> Ranglar
            {savingColors && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          <ColorsEditor colors={visionColors} disabled={savingColors || working} onSave={saveColors} />
          <p className="text-[11px] text-muted-foreground">
            {"AI rangni rasmdan o'qiydi — noto'g'ri bo'lsa tuzating: «Rang» xususiyati shu ro'yxatdan olinadi."}
          </p>
        </div>
      )}

      <ImageStudio
        items={items}
        openId={openId}
        onOpenId={setOpenId}
        busyId={busyId}
        working={working}
        locked={locked}
        priceUsd={draft.imagePriceUsd}
        onRegenerate={regenerate}
        onToggleRemoved={toggleRemoved}
        onRevert={revert}
      />
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
