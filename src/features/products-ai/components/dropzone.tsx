"use client";

import * as React from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    onFiles([...files, ...picked].slice(0, MAX_FILES));
  };

  return (
    <div className="space-y-4">
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
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition",
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm font-medium">Tovar rasmlarini shu yerga tashlang</div>
        <p className="text-xs text-muted-foreground">
          Ko&apos;pi bilan {MAX_FILES} ta, har biri {MAX_MB} MB gacha. Qolganini AI qiladi.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.name}
                className="h-20 w-20 rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => onFiles(files.filter((_, k) => k !== index))}
                disabled={disabled}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-background p-0.5 shadow ring-1 ring-border"
                aria-label="Olib tashlash"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="ai-hint">Izoh (ixtiyoriy)</Label>
        <Input
          id="ai-hint"
          value={hint}
          onChange={(e) => onHint(e.target.value)}
          disabled={disabled}
          maxLength={500}
          placeholder="O'lcham, komplekt, kim uchun — rasm aytmaydigan narsa"
        />
        <p className="text-xs text-muted-foreground">
          Rasmda ko&apos;rinmaydigan narsani shu yerda ayting: AI faqat rasmni
          ko&apos;radi, tovarni esa siz bilasiz.
        </p>
      </div>
    </div>
  );
}
