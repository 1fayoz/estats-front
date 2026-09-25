"use client";

import * as React from "react";
import { AlertTriangle, Check, Layers, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, detectAiVariants, fetchAiVariantTypes, mediaUrl, saveAiVariants } from "@/lib/api";
import type { AiDraft, AiVariantAxis, AiVariantKind, AiVariantType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Variantlar — xaridor bitta kartochkada nima tanlaydi (rang, o'lcham …).
 *
 * Prodda #19 (5 dizaynli tirnoq) hamma rasm bitta dizaynda chiqdi; #20
 * (kiprik) esa rang emas, O'LCHAM bo'yicha variantli. Rang/dizayn — har biri
 * o'z surati bilan alohida chiziladi; o'lcham — matnda va o'lcham kadrida.
 * AI aniqlay olmasa sotuvchidan so'raladi: o'q turi bazadagi kartochkalarda
 * uchragan hamma turdan tanlanadi.
 */

const KIND_LABEL: Record<AiVariantKind, string> = {
  color: "rasmi alohida chiziladi",
  design: "rasmi alohida chiziladi",
  size: "matn va o'lcham kadrida",
  other: "matnda",
};

const SOURCE_LABEL: Record<string, string> = {
  uzum: "Uzum kabinetidan",
  warehouse: "ombordagi SKU'lardan",
  vision: "suratlardan AI aniqladi",
  seller: "siz tanlagansiz",
};

interface EditValue {
  key?: string;
  nameUz: string;
  nameRu: string;
  hex: string;
  images: string[];
  description: string;
}

interface EditAxis {
  titleUz: string;
  titleRu: string;
  kind: AiVariantKind;
  values: EditValue[];
}

function toEdit(axis: AiVariantAxis): EditAxis {
  return {
    titleUz: axis.titleUz, titleRu: axis.titleRu, kind: axis.kind,
    values: axis.values.map((v) => ({ ...v, images: [...v.images] })),
  };
}

export function VariantsPanel({
  draft,
  onChange,
  locked,
}: {
  draft: AiDraft;
  onChange: (draft: AiDraft) => void;
  locked: boolean;
}) {
  const variants = draft.variants ?? {};
  const axes = variants.axes ?? [];
  const [editing, setEditing] = React.useState(false);
  const [types, setTypes] = React.useState<AiVariantType[]>([]);
  const [form, setForm] = React.useState<EditAxis | null>(null);
  const [busy, setBusy] = React.useState<"save" | "detect" | null>(null);

  const needsChoice = Boolean(variants.needsChoice);
  const open = editing || needsChoice;

  React.useEffect(() => {
    if (!open || types.length) return;
    fetchAiVariantTypes().then(setTypes).catch(() => setTypes([]));
  }, [open, types.length]);

  React.useEffect(() => {
    if (!open) return;
    setForm(axes[0] ? toEdit(axes[0]) : { titleUz: "Rang", titleRu: "Цвет", kind: "color", values: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft.variants]);

  // Namuna bo'la oladigan suratlar: sotuvchi yuklagani + Uzum rang galereyasi.
  const photos = React.useMemo(() => {
    const out: string[] = [...draft.sourceImages];
    for (const axis of axes) for (const value of axis.values)
      for (const url of value.images) if (!out.includes(url)) out.push(url);
    return out;
  }, [draft.sourceImages, axes]);

  const save = async () => {
    if (!form) return;
    const values = form.values.filter((v) => v.nameUz.trim());
    setBusy("save");
    try {
      const next = await saveAiVariants(draft.id, values.length ? [{ ...form, values }] : []);
      onChange(next);
      setEditing(false);
      toast.success(values.length
        ? `Variantlar saqlandi — ${values.length} ta. Rasm va matn endi shunga qarab yasaladi.`
        : "Variantlar olib tashlandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const detect = async () => {
    setBusy("detect");
    try {
      const next = await detectAiVariants(draft.id);
      onChange(next);
      const found = next.variants?.axes ?? [];
      toast.success(found.length
        ? `${found.map((a) => `${a.titleUz}: ${a.values.length}`).join(", ")} — aniqlandi.`
        : "Variant topilmadi — bitta ko'rinishdagi tovar.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Aniqlab bo'lmadi.");
    } finally {
      setBusy(null);
    }
  };

  const setValue = (index: number, patch: Partial<EditValue>) =>
    setForm((f) => f && { ...f, values: f.values.map((v, i) => (i === index ? { ...v, ...patch } : v)) });

  const chooseType = (title: string) => {
    const type = types.find((t) => t.titleUz === title);
    setForm((f) => f && { ...f, titleUz: title, titleRu: type?.titleRu ?? f.titleRu, kind: type?.kind ?? f.kind });
  };

  const visual = form ? form.kind === "color" || form.kind === "design" : false;

  return (
    <div className={cn("space-y-2.5 rounded-xl border p-3",
      needsChoice ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/20")}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Layers className="size-3.5 shrink-0" />
        <span className="font-semibold">Variantlar</span>
        {axes.length > 0 && !needsChoice ? (
          <span className="min-w-0 flex-1 text-muted-foreground">
            {axes.map((a) => `${a.titleUz}: ${a.values.map((v) => v.nameUz).join(", ")}`).join(" · ")}
            {variants.source ? ` — ${SOURCE_LABEL[variants.source] ?? variants.source}` : ""}
          </span>
        ) : (
          <span className="min-w-0 flex-1 text-muted-foreground">
            {needsChoice ? "" : "Variant yo'q — bitta ko'rinishdagi tovar."}
          </span>
        )}
        {!locked && !editing && (
          <>
            <Button type="button" variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-xs"
              disabled={busy !== null} onClick={() => void detect()}>
              {busy === "detect" ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Qayta aniqlash
            </Button>
            {!needsChoice && (
              <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg px-2 text-xs"
                onClick={() => setEditing(true)}>
                {axes.length ? "Tuzatish" : "Qo'shish"}
              </Button>
            )}
          </>
        )}
      </div>

      {needsChoice && (
        <p className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
          <span>{variants.question || "Variantlar nima bo'yicha farq qilishini tanlang."}</span>
        </p>
      )}

      {open && form && !locked && (
        <div className="space-y-3 rounded-lg border bg-background p-3">
          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Nima bo&apos;yicha farq qiladi?</span>
            <select
              className="air-input h-10 w-full text-sm"
              value={form.titleUz}
              onChange={(e) => chooseType(e.target.value)}
            >
              {!types.some((t) => t.titleUz === form.titleUz) && <option value={form.titleUz}>{form.titleUz}</option>}
              {types.map((t) => (
                <option key={t.titleUz} value={t.titleUz}>
                  {`${t.titleUz}${t.titleRu ? ` / ${t.titleRu.trim()}` : ""}${t.count ? ` — bazada ${t.count} ta kartochkada` : ""}`}
                </option>
              ))}
            </select>
            <span className="block text-[11px] text-muted-foreground">
              {`${visual ? "Rang/dizayn" : "Bu tur"} — ${KIND_LABEL[form.kind]}.`}
              {visual && " Har variant uchun uni ko'rsatadigan suratni belgilang."}
            </span>
          </label>

          <div className="space-y-2">
            {form.values.map((value, index) => (
              <div key={value.key ?? index} className="space-y-2 rounded-lg border p-2.5">
                <div className="flex items-center gap-2">
                  {value.hex && <span className="size-5 shrink-0 rounded-full border" style={{ background: value.hex }} />}
                  <Input className="h-9 flex-1 text-sm" value={value.nameUz} maxLength={60}
                    placeholder="Nomi (o'zbekcha)" onChange={(e) => setValue(index, { nameUz: e.target.value })} />
                  <Input className="h-9 w-32 text-sm" value={value.nameRu} maxLength={60}
                    placeholder="Ruscha" onChange={(e) => setValue(index, { nameRu: e.target.value })} />
                  <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0 text-destructive"
                    onClick={() => setForm((f) => f && { ...f, values: f.values.filter((_, i) => i !== index) })}
                    aria-label={`${value.nameUz} — o'chirish`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {visual && photos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {photos.map((url) => {
                      const on = value.images.includes(url);
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setValue(index, {
                            images: on ? value.images.filter((u) => u !== url) : [...value.images, url],
                          })}
                          className={cn("relative h-14 w-11 overflow-hidden rounded-md border-2 transition",
                            on ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}
                          aria-pressed={on}
                          aria-label={on ? "Namunadan olib tashlash" : "Namuna qilib belgilash"}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                          {on && (
                            <span className="absolute right-0.5 top-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                              <Check className="size-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {visual && value.images.length === 0 && (
                  <p className="text-[11px] air-warn">{"Surat belgilanmagan — AI bu variantni faqat nomidan chizadi."}</p>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="rounded-lg"
              onClick={() => setForm((f) => f && { ...f, values: [...f.values, { nameUz: "", nameRu: "", hex: "", images: [], description: "" }] })}>
              <Plus /> Variant qo&apos;shish
            </Button>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {editing && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={busy !== null}>
                Bekor qilish
              </Button>
            )}
            <Button type="button" size="sm" className="rounded-lg" disabled={busy !== null} onClick={() => void save()}>
              {busy === "save" && <Loader2 className="animate-spin" />}
              Saqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
