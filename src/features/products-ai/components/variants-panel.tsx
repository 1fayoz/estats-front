"use client";

import * as React from "react";
import { AlertTriangle, Check, Layers, Loader2, Plus, RefreshCw, Scissors, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_SKUS, SplitDialog } from "@/features/products-ai/components/split-dialog";
import { ApiError, detectAiVariants, fetchAiVariantTypes, mediaUrl, saveAiVariants } from "@/lib/api";
import type { AiDraft, AiVariantAxis, AiVariantKind, AiVariantSuggestion, AiVariantType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Variantlar — xaridor bitta kartochkada nima tanlaydi. Bitta tovarda bir
 * nechta O'Q bo'lishi odatiy (2026-09-27, 976 kartochka tahlili): chexol —
 * Rang + Model («qora, iPhone 11 Pro Max»), futbolka — Rang + Kiyim
 * o'lchami, choyshab — Rang + O'lcham. Uzum'da SKU'lar o'qlar ko'paytmasi.
 *
 * Rang/dizayn — har qiymat o'z surati bilan alohida chiziladi (Uzum'da
 * «Rang» yagona rasmli o'q); qolganlari — matnda va SKU'da. Raqobatchilarda
 * bor-u bu tovarda yo'q o'q tavsiya bo'lib chiqadi: qaysi modellar sotuvchida
 * borligini faqat u biladi, shuning uchun qiymatlarni o'zi tanlaydi.
 */

const KIND_LABEL: Record<AiVariantKind, string> = {
  color: "rasmi alohida chiziladi",
  design: "rasmi alohida chiziladi",
  size: "matnda, o'lcham kadrida va SKU'da",
  model: "matnda va SKU'da (ko'rinishi bir xil)",
  other: "matnda va SKU'da",
};

const SOURCE_LABEL: Record<string, string> = {
  uzum: "Uzum kabinetidan",
  warehouse: "ombordagi SKU'lardan",
  vision: "suratlar va izohdan AI aniqladi",
  seller: "siz tanlagansiz",
};

/** Uzum formasi: rangdan tashqari ko'pi bilan 3 ta o'q. */
const MAX_CUSTOM = 3;

interface EditValue {
  key?: string;
  nameUz: string;
  nameRu: string;
  hex: string;
  images: string[];
  description: string;
}

interface EditAxis {
  id: number;
  titleUz: string;
  titleRu: string;
  kind: AiVariantKind;
  values: EditValue[];
}

const isVisual = (kind: AiVariantKind) => kind === "color" || kind === "design";

let nextId = 1;
function toEdit(axis: AiVariantAxis): EditAxis {
  return {
    id: nextId++, titleUz: axis.titleUz, titleRu: axis.titleRu, kind: axis.kind,
    values: axis.values.map((v) => ({ ...v, images: [...v.images] })),
  };
}

const blankValue = (nameUz = "", nameRu = ""): EditValue =>
  ({ nameUz, nameRu, hex: "", images: [], description: "" });

function toPayload(axes: EditAxis[]) {
  return axes
    .map((a) => ({ titleUz: a.titleUz, titleRu: a.titleRu, kind: a.kind, values: a.values.filter((v) => v.nameUz.trim()) }))
    .filter((a) => a.titleUz.trim() && a.values.length);
}

const skuCount = (axes: { values: unknown[] }[]) =>
  axes.length ? axes.reduce((n, a) => n * Math.max(1, a.values.length), 1) : 0;

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
  const axes = React.useMemo(() => variants.axes ?? [], [variants.axes]);
  const pending = variants.pending ?? [];
  const [editing, setEditing] = React.useState(false);
  const [splitOpen, setSplitOpen] = React.useState(false);
  const [types, setTypes] = React.useState<AiVariantType[]>([]);
  const [form, setForm] = React.useState<EditAxis[] | null>(null);
  const [busy, setBusy] = React.useState<"save" | "detect" | string | null>(null);

  const needsChoice = Boolean(variants.needsChoice);
  const open = editing || needsChoice;

  React.useEffect(() => {
    if ((!open && !pending.length) || types.length) return;
    fetchAiVariantTypes().then(setTypes).catch(() => setTypes([]));
  }, [open, pending.length, types.length]);

  React.useEffect(() => {
    if (!open) return;
    setForm(axes.length ? axes.map(toEdit) : [{ id: nextId++, titleUz: "Rang", titleRu: "Цвет", kind: "color", values: [] }]);
  }, [open, axes]);

  // Namuna bo'la oladigan suratlar: sotuvchi yuklagani + Uzum rang galereyasi.
  const photos = React.useMemo(() => {
    const out: string[] = [...draft.sourceImages];
    for (const axis of axes) for (const value of axis.values)
      for (const url of value.images) if (!out.includes(url)) out.push(url);
    return out;
  }, [draft.sourceImages, axes]);

  const persist = async (next: ReturnType<typeof toPayload>, dismissed: string[] = [], message?: string) => {
    const saved = await saveAiVariants(draft.id, next, dismissed);
    onChange(saved);
    const count = saved.variants?.skuCount ?? skuCount(next);
    toast.success(message ?? (next.length
      ? `Variantlar saqlandi — ${count} ta SKU. Rasm va matn endi shunga qarab yasaladi.`
      : "Variantlar olib tashlandi."));
  };

  const save = async () => {
    if (!form) return;
    setBusy("save");
    try {
      await persist(toPayload(form));
      setEditing(false);
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

  const acceptSuggestion = async (suggestion: AiVariantSuggestion, values: EditValue[]) => {
    setBusy(suggestion.key);
    try {
      const next = [...axes.map(toEdit), {
        id: nextId++, titleUz: suggestion.titleUz, titleRu: suggestion.titleRu, kind: suggestion.kind, values,
      }];
      await persist(toPayload(next), [], `«${suggestion.titleUz}» qo'shildi — ${values.length} ta qiymat.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const dismissSuggestion = async (suggestion: AiVariantSuggestion) => {
    setBusy(suggestion.key);
    try {
      await persist(toPayload(axes.map(toEdit)), [suggestion.key], `«${suggestion.titleUz}» kerak emas deb belgilandi.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const setAxis = (id: number, patch: Partial<EditAxis>) =>
    setForm((f) => f && f.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const customCount = form ? form.filter((a) => a.kind !== "color").length : 0;
  const hasVisual = form ? form.some((a) => isVisual(a.kind)) : false;
  const formSkus = form ? skuCount(toPayload(form)) : 0;

  return (
    <div className={cn("space-y-2.5 rounded-xl border p-3",
      needsChoice || pending.length ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/20")}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Layers className="size-3.5 shrink-0" />
        <span className="font-semibold">Variantlar</span>
        {axes.length > 0 && !needsChoice ? (
          <span className="min-w-0 flex-1 text-muted-foreground">
            {axes.map((a) => `${a.titleUz}: ${a.values.length > 4
              ? `${a.values.slice(0, 3).map((v) => v.nameUz).join(", ")} va yana ${a.values.length - 3}`
              : a.values.map((v) => v.nameUz).join(", ")}`).join(" · ")}
            {(variants.skuCount ?? 0) > 1 ? ` — ${variants.skuCount} ta SKU` : ""}
            {variants.source ? ` (${SOURCE_LABEL[variants.source] ?? variants.source})` : ""}
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

      {(variants.skuCount ?? 0) > MAX_SKUS && !needsChoice && (
        <p className="flex items-start gap-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {`${variants.skuCount} ta SKU — Uzum 100 va undan ortiq SKU'li tovarda xususiyatlarni saqlamaydi. `}
            {"Tizim kartochkani o'zi bo'lib beradi (masalan iPhone 11–14 va 15–17 alohida)."}
            {!locked && (
              <Button type="button" variant="outline" size="sm" className="ml-2 h-7 rounded-lg px-2 text-xs"
                onClick={() => setSplitOpen(true)}>
                <Scissors className="size-3.5" /> Kartochkani bo&apos;lish
              </Button>
            )}
          </span>
        </p>
      )}
      <SplitDialog draft={draft} open={splitOpen} onOpenChange={setSplitOpen} onDone={onChange} />

      {needsChoice && (
        <p className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
          <span>{variants.question || "Variantlar nima bo'yicha farq qilishini tanlang."}</span>
        </p>
      )}

      {!locked && !editing && pending.map((suggestion) => (
        <SuggestionCard key={suggestion.key} suggestion={suggestion} busy={busy === suggestion.key}
          disabled={busy !== null} onAccept={(values) => void acceptSuggestion(suggestion, values)}
          onDismiss={() => void dismissSuggestion(suggestion)} />
      ))}

      {open && form && !locked && (
        <div className="space-y-3">
          {form.map((axis) => (
            <AxisEditor key={axis.id} axis={axis} types={types} photos={photos}
              onChange={(patch) => setAxis(axis.id, patch)}
              onRemove={() => setForm((f) => f && f.filter((a) => a.id !== axis.id))} />
          ))}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-lg"
              disabled={customCount >= MAX_CUSTOM && hasVisual}
              onClick={() => setForm((f) => f && [...f, hasVisual
                ? { id: nextId++, titleUz: "Model", titleRu: "Модель", kind: "model", values: [] }
                : { id: nextId++, titleUz: "Rang", titleRu: "Цвет", kind: "color", values: [] }])}>
              <Plus /> Yana o&apos;q qo&apos;shish
            </Button>
            <span className="text-[11px] text-muted-foreground">
              {formSkus > MAX_SKUS
                ? `${formSkus} ta SKU — Uzum 99 tadan ko'pini qabul qilmaydi, kamaytiring. `
                : formSkus > 1 ? `Uzum'da ${formSkus} ta SKU bo'ladi (har kombinatsiya — alohida SKU). ` : ""}
              Rangdan tashqari ko&apos;pi bilan {MAX_CUSTOM} ta o&apos;q.
            </span>
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

/** Raqobatchilarda bor o'q: sotuvchi o'zidagi qiymatlarni belgilaydi yoki o'zi yozadi. */
function SuggestionCard({
  suggestion, busy, disabled, onAccept, onDismiss,
}: {
  suggestion: AiVariantSuggestion;
  busy: boolean;
  disabled: boolean;
  onAccept: (values: EditValue[]) => void;
  onDismiss: () => void;
}) {
  const [picked, setPicked] = React.useState<string[]>([]);
  const [extra, setExtra] = React.useState<string[]>([]);
  const [text, setText] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);
  const values = showAll ? suggestion.values : suggestion.values.slice(0, 24);

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  const addTyped = () => {
    const parts = text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setExtra((e) => [...e, ...parts.filter((p) => !e.includes(p) && !picked.includes(p))]);
    setText("");
  };
  const chosen = [
    ...suggestion.values.filter((v) => picked.includes(v.nameUz)).map((v) => blankValue(v.nameUz, v.nameRu)),
    ...extra.map((name) => blankValue(name)),
  ];

  return (
    <div className="space-y-2 rounded-lg border bg-background p-3">
      <p className="flex items-start gap-2 text-xs">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
        <span>
          {"Raqobatchilar bu tovarni "}<b>{`«${suggestion.titleUz}»`}</b>
          {` bo'yicha ham sotadi${suggestion.total ? ` (${suggestion.count}/${suggestion.total} ta kartochkada)` : ""}`}
          {` — xaridor rangdan tashqari ${suggestion.titleUz.toLowerCase()}ni ham tanlaydi. Sizda qaysilari bor? Belgilang yoki yozing.`}
        </span>
      </p>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => {
            const on = picked.includes(v.nameUz);
            return (
              <button key={v.nameUz} type="button" onClick={() => toggle(v.nameUz)} aria-pressed={on}
                className={cn("rounded-full border px-2.5 py-1 text-[11px] transition",
                  on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>
                {on && <Check className="-ml-0.5 mr-1 inline size-3" />}{v.nameUz}
              </button>
            );
          })}
          {suggestion.values.length > 24 && !showAll && (
            <button type="button" className="px-1 text-[11px] text-primary underline" onClick={() => setShowAll(true)}>
              {`yana ${suggestion.values.length - 24} ta`}
            </button>
          )}
        </div>
      )}
      {extra.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {extra.map((name) => (
            <span key={name} className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-[11px]">
              {name}
              <button type="button" aria-label={`${name} — olib tashlash`} onClick={() => setExtra((e) => e.filter((x) => x !== name))}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Input className="h-8 min-w-48 flex-1 text-xs" value={text} maxLength={400}
          placeholder="Boshqasi: vergul bilan bir nechta yozish mumkin"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTyped(); } }} />
        <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg text-xs" disabled={!text.trim()} onClick={addTyped}>
          <Plus /> Yozilganini qo&apos;shish
        </Button>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg text-xs" disabled={disabled} onClick={onDismiss}>
          Kerak emas
        </Button>
        <Button type="button" size="sm" className="h-8 rounded-lg text-xs" disabled={disabled || chosen.length < 2}
          onClick={() => onAccept(chosen)}>
          {busy && <Loader2 className="animate-spin" />}
          {chosen.length < 2 ? "Kamida 2 ta tanlang" : `«${suggestion.titleUz}» qo'shish — ${chosen.length} ta`}
        </Button>
      </div>
    </div>
  );
}

function AxisEditor({
  axis, types, photos, onChange, onRemove,
}: {
  axis: EditAxis;
  types: AiVariantType[];
  photos: string[];
  onChange: (patch: Partial<EditAxis>) => void;
  onRemove: () => void;
}) {
  const [text, setText] = React.useState("");
  const visual = isVisual(axis.kind);

  const setValue = (index: number, patch: Partial<EditValue>) =>
    onChange({ values: axis.values.map((v, i) => (i === index ? { ...v, ...patch } : v)) });
  const chooseType = (title: string) => {
    const type = types.find((t) => t.titleUz === title);
    onChange({ titleUz: title, titleRu: type?.titleRu ?? axis.titleRu, kind: type?.kind ?? axis.kind });
  };
  const addTyped = () => {
    const names = axis.values.map((v) => v.nameUz.toLowerCase());
    const parts = text.split(/[,;\n]/).map((s) => s.trim()).filter((s) => s && !names.includes(s.toLowerCase()));
    if (!parts.length) return;
    onChange({ values: [...axis.values, ...parts.map((p) => blankValue(p))] });
    setText("");
  };

  return (
    <div className="space-y-3 rounded-lg border bg-background p-3">
      <div className="flex items-start gap-2">
        <label className="block flex-1 space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Nima bo&apos;yicha farq qiladi?</span>
          <select className="air-input h-10 w-full text-sm" value={axis.titleUz} onChange={(e) => chooseType(e.target.value)}>
            {!types.some((t) => t.titleUz === axis.titleUz) && <option value={axis.titleUz}>{axis.titleUz}</option>}
            {types.map((t) => (
              <option key={t.titleUz} value={t.titleUz}>
                {`${t.titleUz}${t.titleRu ? ` / ${t.titleRu.trim()}` : ""}${t.count ? ` — bazada ${t.count} ta kartochkada` : ""}`}
              </option>
            ))}
          </select>
          <span className="block text-[11px] text-muted-foreground">
            {`${visual ? "Rang/dizayn" : "Bu o'q"} — ${KIND_LABEL[axis.kind]}.`}
            {visual && " Har variant uchun uni ko'rsatadigan suratni belgilang."}
          </span>
        </label>
        <Button type="button" variant="ghost" size="icon" className="mt-5 size-9 shrink-0 text-destructive"
          onClick={onRemove} aria-label={`«${axis.titleUz}» o'qini olib tashlash`}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      {visual ? (
        <div className="space-y-2">
          {axis.values.map((value, index) => (
            <div key={value.key ?? index} className="space-y-2 rounded-lg border p-2.5">
              <div className="flex items-center gap-2">
                {value.hex && <span className="size-5 shrink-0 rounded-full border" style={{ background: value.hex }} />}
                <Input className="h-9 flex-1 text-sm" value={value.nameUz} maxLength={60}
                  placeholder="Nomi (o'zbekcha)" onChange={(e) => setValue(index, { nameUz: e.target.value })} />
                <Input className="h-9 w-32 text-sm" value={value.nameRu} maxLength={60}
                  placeholder="Ruscha" onChange={(e) => setValue(index, { nameRu: e.target.value })} />
                <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0 text-destructive"
                  onClick={() => onChange({ values: axis.values.filter((_, i) => i !== index) })}
                  aria-label={`${value.nameUz} — o'chirish`}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {photos.map((url) => {
                    const on = value.images.includes(url);
                    return (
                      <button key={url} type="button"
                        onClick={() => setValue(index, { images: on ? value.images.filter((u) => u !== url) : [...value.images, url] })}
                        className={cn("relative h-14 w-11 overflow-hidden rounded-md border-2 transition",
                          on ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}
                        aria-pressed={on} aria-label={on ? "Namunadan olib tashlash" : "Namuna qilib belgilash"}>
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
              {value.images.length === 0 && (
                <p className="text-[11px] air-warn">{"Surat belgilanmagan — AI bu variantni faqat nomidan chizadi."}</p>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="rounded-lg"
            onClick={() => onChange({ values: [...axis.values, blankValue()] })}>
            <Plus /> Variant qo&apos;shish
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {axis.values.map((value, index) => (
              <span key={`${value.nameUz}-${index}`} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]">
                {value.nameUz}
                <button type="button" aria-label={`${value.nameUz} — olib tashlash`}
                  onClick={() => onChange({ values: axis.values.filter((_, i) => i !== index) })}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {axis.values.length === 0 && <span className="text-[11px] text-muted-foreground">{"Qiymat yo'q"}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Input className="h-8 flex-1 text-xs" value={text} maxLength={400}
              placeholder={axis.kind === "model" ? "Masalan: iPhone 11 Pro Max, iPhone 12, iPhone 13" : "Qiymatlar — vergul bilan"}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTyped(); } }} />
            <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled={!text.trim()} onClick={addTyped}>
              <Plus /> Qo&apos;shish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
