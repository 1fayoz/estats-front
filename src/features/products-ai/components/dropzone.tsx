"use client";

import * as React from "react";
import { Check, ImagePlus, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export const MAX_FILES = 6;
const MAX_MB = 10;

/**
 * Rasm tanlash — sotuvchi qiladigan YAGONA ish.
 *
 * Shuning uchun bu yerda faqat ikkita maydon bor: rasmlar va
 * ixtiyoriy izoh. Nom, tavsif, xususiyat va narx so'ralmaydi —
 * ularni AI yozadi va sotuvchi keyin tuzatadi.
 *
 * Komponent BOSHQARILADIGAN: fayllar ham, yuborish tugmasi ham
 * modalda turadi. Sabab — modalning ost qismi (Bitrix naqshi):
 * asosiy amal har doim o'sha yerda bo'lishi kerak, forma ichida
 * yana bitta "Boshlash" tugmasi ikkilanish tug'diradi.
 */
export function DropZone({
  files,
  onFiles,
  hint,
  onHint,
  disabled,
}: {
  files: File[];
  onFiles: (files: File[]) => void;
  hint: string;
  onHint: (hint: string) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();
  const [previews, setPreviews] = React.useState<{ name: string; url: string }[]>([]);

  // Ob'ekt URL'lari qo'lda bo'shatiladi — aks holda modal ochilgan
  // sayin xotira o'sib boradi. URL'lar EFFEKT ichida yasaladi:
  // `useMemo` da yasalganda React'ning qat'iy rejimi effektni
  // mount → cleanup → mount qilib, birinchi cleanup URL'larni
  // bo'shatadi va rasmlar buzilib qoladi (memo qayta hisoblanmaydi).
  React.useEffect(() => {
    const made = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(made);
    return () => made.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [files]);

  const add = (incoming: FileList | null) => {
    if (!incoming) return;
    const picked: File[] = [];
    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: faqat rasm fayllari.`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name}: ${MAX_MB} MB dan katta.`);
        continue;
      }
      picked.push(file);
    }
    if (files.length + picked.length > MAX_FILES) {
      toast.info(`Ko'pi bilan ${MAX_FILES} ta rasm qo'shish mumkin.`);
    }
    onFiles([...files, ...picked].slice(0, MAX_FILES));
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-200 motion-reduce:transition-none",
          dragging
            ? "border-[color:var(--ok)] bg-emerald-500/10"
            : "border-[color:var(--air-ctl-line)] bg-muted/40 hover:border-[color:var(--ok)] hover:bg-emerald-500/5",
          disabled && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || files.length >= MAX_FILES}
          className={cn(
            "group flex w-full flex-col items-center justify-center px-4 text-center outline-offset-[-4px] focus-visible:outline-2 focus-visible:outline-[color:var(--ok)]",
            files.length ? "gap-2 py-5" : "gap-3 py-8 sm:py-12",
          )}
        >
          {files.length ? (
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-[color:var(--ok)]">
              {files.length >= MAX_FILES ? <Check className="size-5" /> : <Plus className="size-5" />}
            </span>
          ) : (
            <span className="relative mb-2 flex size-20 items-center justify-center">
              <span className="absolute inset-1 rotate-[-10deg] rounded-2xl border border-emerald-500/20 bg-emerald-500/10 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:rotate-[-15deg]" />
              <span className="relative flex size-16 rotate-[5deg] items-center justify-center rounded-2xl border border-[color:var(--air-line)] bg-[color:var(--air-card)] text-[color:var(--ok)] shadow-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:rotate-0 motion-safe:group-hover:-translate-y-1">
                <ImagePlus className="size-7" />
              </span>
            </span>
          )}
          <span className="text-sm font-semibold sm:text-base">
            {files.length >= MAX_FILES ? "Barcha rasmlar qo'shildi" : files.length ? "Yana rasm qo'shish" : dragging ? "Rasmlarni shu yerga qo'yib yuboring" : "Rasmlarni shu yerga tashlang"}
          </span>
          {!files.length && (
            <>
              <span className="text-xs text-muted-foreground sm:text-sm">yoki qurilmangizdan tanlang</span>
              <span className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[color:var(--air-card)] px-5 text-[13px] font-semibold shadow-sm ring-1 ring-[color:var(--air-ctl-line)]">
                <Upload className="size-4 text-[color:var(--ok)]" /> Rasm tanlash
              </span>
            </>
          )}
          <span className="mt-1 text-[11px] text-muted-foreground sm:text-xs">JPG, PNG, WEBP · {MAX_FILES} tagacha · Har biri {MAX_MB} MB gacha</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={disabled || files.length >= MAX_FILES}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {previews.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-medium">Tanlangan rasmlar</span>
            <span className="tabular-nums text-muted-foreground" aria-live="polite">{files.length} / {MAX_FILES}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
          {previews.map((preview, index) => (
            <div key={preview.url} className="group relative min-w-0 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.name}
                className="aspect-square w-full rounded-xl bg-muted object-cover ring-1 ring-[color:var(--air-line)]"
              />
              <button
                type="button"
                onClick={() => onFiles(files.filter((_, fileIndex) => fileIndex !== index))}
                disabled={disabled}
                className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-xl bg-slate-950/70 text-white transition-colors hover:bg-red-600"
                aria-label={`${preview.name} rasmini olib tashlash`}
              >
                <X className="size-4" />
              </button>
              <p className="mt-1.5 truncate text-[10px] text-muted-foreground" title={preview.name}>{preview.name}</p>
            </div>
          ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="text-[13px] font-semibold" htmlFor={hintId}>Tovar haqida qo'shimcha</label>
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">Ixtiyoriy</span>
        </div>
        <textarea
          id={hintId}
          className="air-input min-h-28 resize-y"
          rows={3}
          value={hint}
          onChange={(e) => onHint(e.target.value)}
          disabled={disabled}
          maxLength={500}
          placeholder="Masalan: 500 ml, zanglamas po'lat, to'plamda 2 ta. Rang: oq."
          aria-describedby={`${hintId}-help`}
        />
        <div className="mt-2 flex items-start justify-between gap-3 text-[11px] text-muted-foreground">
          <p id={`${hintId}-help`} className="leading-relaxed">O'lchami, materiali va komplektini yozsangiz, tavsif aniqroq bo'ladi.</p>
          <span className="shrink-0 tabular-nums">{hint.length}/500</span>
        </div>
      </div>
    </div>
  );
}
